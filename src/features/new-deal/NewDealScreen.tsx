import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Decimal } from "decimal.js";
import { router } from "expo-router";
import { CircleCheck, FileUp, Plus, Trash2 } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { formatAedWhole } from "@/features/dashboard";
import type { DealDetail, MilestoneConfidence, NewDealDocumentInput, SpaExtractionInput } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import type { MilestoneTrigger } from "@/shared/data/database.types";
import { useFeatureFlag } from "@/shared/featureFlags/FeatureFlagProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { captureNonFatalError, finishPerformanceJourney, startPerformanceJourney } from "@/shared/observability/sentry";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { Button, GoldButton } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { Input } from "@/shared/ui/Input";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Screen } from "@/shared/ui/Screen";
import { OptionChip } from "@/shared/ui/SelectableControls";
import { Text } from "@/shared/ui/Text";

import { buildNewDealFormSchema, defaultMilestone, milestoneInputToForm, toCreateDealInput, type NewDealFormValues } from "./newDealSchema";

type PendingSpaDocument = NewDealDocumentInput & {
  dealId: string;
};

const triggerOptions: { labelKey: string; value: MilestoneTrigger }[] = [
  { labelKey: "newDeal.triggerBooking", value: "booking" },
  { labelKey: "newDeal.triggerDld", value: "registration" },
  { labelKey: "newDeal.triggerBuild", value: "construction" },
  { labelKey: "newDeal.triggerHandover", value: "handover" },
];

function stripNumber(value: string) {
  return value.replace(/,/g, "").trim();
}

// Live version of the same reconciliation check the Zod superRefine (and the
// server RPC) enforce at submit time — surfaced as a positive confirmation
// while editing, mirroring the design system's SPA-review validation banner.
function computeReconciliation(totalValueAed: string | undefined, milestones: { amountAed?: string; percent?: string }[] | undefined) {
  const empty = { reconciles: false, totalLabel: "" };

  if (!totalValueAed || !milestones?.length) {
    return empty;
  }

  let total: Decimal;
  try {
    total = new Decimal(stripNumber(totalValueAed));
  } catch {
    return empty;
  }

  if (total.lessThanOrEqualTo(0)) {
    return empty;
  }

  let amountSum = new Decimal(0);
  let percentSum = new Decimal(0);

  for (const milestone of milestones) {
    try {
      amountSum = amountSum.plus(new Decimal(stripNumber(milestone.amountAed ?? "")));
      percentSum = percentSum.plus(new Decimal(stripNumber(milestone.percent ?? "")));
    } catch {
      return empty;
    }
  }

  const amountTolerance = Decimal.max(1, total.times(0.005));
  const reconciles = amountSum.minus(total).abs().lessThanOrEqualTo(amountTolerance) && percentSum.minus(100).abs().lessThanOrEqualTo(1);

  return { reconciles, totalLabel: formatAedWhole(total.toDecimalPlaces(0).toFixed(0)) };
}

export function NewDealScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { deals: dealsRepository } = useRepositories();
  const { theme } = useTheme();
  const { isRTL } = useI18nControls();
  const styles = useThemedStyles(makeStyles);
  const aiSpaExtractionEnabled = useFeatureFlag("ai_spa_extraction");
  const [pendingSpaDocument, setPendingSpaDocument] = useState<PendingSpaDocument | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Rebuilt when the language changes so validation errors localize.
  const newDealFormSchema = useMemo(() => buildNewDealFormSchema(t), [t]);

  const form = useForm<NewDealFormValues>({
    resolver: zodResolver(newDealFormSchema),
    defaultValues: {
      project: "",
      developer: "",
      buyerName: "",
      totalValueAed: "",
      milestones: [defaultMilestone()],
    },
  });

  const { control, formState, handleSubmit, setValue } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "milestones",
  });

  // AI-extracted rows (money figures) need an explicit confirm tap before Save
  // — trust-but-verify, matching the design system's SPA review flow. Keyed by
  // the field-array's stable row id, not index, so it survives add/remove.
  const [confirmedFieldIds, setConfirmedFieldIds] = useState<Set<string>>(new Set());
  const unconfirmedAiFields = fields.filter((field) => field.source === "spa_extracted" && !confirmedFieldIds.has(field.id));

  const watchedMilestones = useWatch({ control, name: "milestones" });
  const watchedTotal = useWatch({ control, name: "totalValueAed" });
  const reconciliation = useMemo(() => computeReconciliation(watchedTotal, watchedMilestones), [watchedTotal, watchedMilestones]);

  function confirmMilestone(fieldId: string) {
    setConfirmedFieldIds((current) => new Set(current).add(fieldId));
  }

  useEffect(() => {
    startPerformanceJourney("new_deal_to_saved");

    return () => {
      finishPerformanceJourney("new_deal_to_saved", {
        outcome: "abandoned",
      });
    };
  }, []);

  const createDealMutation = useMutation<DealDetail, Error, NewDealFormValues>({
    mutationFn: (values) => dealsRepository.createDeal(toCreateDealInput(values, pendingSpaDocument)),
    onSuccess: (deal) => {
      finishPerformanceJourney("new_deal_to_saved", {
        has_spa_document: Boolean(pendingSpaDocument),
        milestone_count: deal.milestones.length,
        outcome: "saved",
      });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-deals"] });
      router.replace({ pathname: "/deal/[dealId]", params: { dealId: deal.id } });
    },
  });

  const extractSpaMutation = useMutation({
    mutationFn: (input: SpaExtractionInput) => dealsRepository.extractSpaMilestones(input),
    onSuccess: (result, input) => {
      setPendingSpaDocument({
        dealId: result.dealId,
        originalName: input.fileName,
        storagePath: result.storagePath,
      });
      replace(result.milestones.map(milestoneInputToForm));
      setAiMessage(t("newDeal.aiFilledMilestones", { count: result.milestones.length }));
    },
    onError: (error) => {
      captureNonFatalError("spa_extraction_failed_but_app_continued", error, { surface: "new_deal" });
      setAiMessage(error instanceof Error ? error.message : t("newDeal.spaExtractionFailed"));
    },
  });

  async function pickSpaPdf() {
    setAiMessage(null);

    try {
      const DocumentPicker = await import("expo-document-picker");
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "application/pdf",
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri) {
        setAiMessage(t("newDeal.couldNotReadPdf"));
        return;
      }

      // Reject oversized PDFs before upload/parse (server + bucket cap at 10 MB too).
      const MAX_SPA_BYTES = 10 * 1024 * 1024;
      if (typeof asset.size === "number" && asset.size > MAX_SPA_BYTES) {
        setAiMessage(t("newDeal.fileTooLarge"));
        return;
      }

      extractSpaMutation.mutate({
        fileUri: asset.uri,
        fileName: asset.name || "SPA.pdf",
        mimeType: asset.mimeType || "application/pdf",
      });
    } catch (error) {
      captureNonFatalError("spa_document_picker_failed", error, { surface: "new_deal" });
      setAiMessage(t("newDeal.couldNotOpenPicker"));
    }
  }

  function addMilestone() {
    append(defaultMilestone());
  }

  function saveDeal(values: NewDealFormValues) {
    createDealMutation.mutate(values);
  }

  const submitError = createDealMutation.error?.message ?? formState.errors.milestones?.root?.message;
  const isSaving = createDealMutation.isPending;
  const isExtracting = extractSpaMutation.isPending;

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360 }}>
          <Button variant="text" size="md" label={t("newDeal.cancel")} accessibilityLabel={t("newDeal.cancelNewDeal")} onPress={() => router.back()} style={styles.cancel} />
          <Text variant="h1" style={styles.title}>
            {t("newDeal.title")}
          </Text>
        </MotiView>

        {aiSpaExtractionEnabled ? (
          <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 80 }}>
            <PressableScale
              accessibilityLabel={t("newDeal.uploadSpaPdf")}
              disabled={isExtracting}
              haptic
              focusRadius={16 + 3}
              pressScale={0.98}
              pressableStyle={styles.dropZone}
              onPress={pickSpaPdf}
            >
              <FileUp size={24} color={theme.color.action} strokeWidth={2.1} />
              <Text variant="cardTitle" style={styles.dropTitle}>
                {t("newDeal.dropSpaPdf")}
              </Text>
              <Text variant="caption" muted style={styles.dropText}>
                {isExtracting ? t("newDeal.readingPaymentPlan") : t("newDeal.readAndFillPlan")}
              </Text>
            </PressableScale>
            {aiMessage ? (
              <Text variant="caption" style={[styles.aiMessage, extractSpaMutation.isError && styles.errorText]}>
                {aiMessage}
              </Text>
            ) : null}
          </MotiView>
        ) : null}

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 160 }}>
          <Controller
            control={control}
            name="project"
            render={({ field, fieldState }) => <Input label={t("newDeal.project")} placeholder={t("newDeal.projectPlaceholder")} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
          <Controller
            control={control}
            name="developer"
            render={({ field, fieldState }) => <Input label={t("newDeal.developer")} placeholder={t("newDeal.developerPlaceholder")} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
          <Controller
            control={control}
            name="buyerName"
            render={({ field, fieldState }) => <Input label={t("newDeal.buyerName")} placeholder={t("newDeal.buyerNamePlaceholder")} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
          <Controller
            control={control}
            name="totalValueAed"
            render={({ field, fieldState }) => <Input label={t("newDeal.totalValueAed")} placeholder={t("newDeal.totalValuePlaceholder")} keyboardType="numeric" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 240 }}>
          <View style={styles.planHeader}>
            <Text variant="cardTitle" style={styles.planTitle}>
              {t("newDeal.paymentPlan")}
            </Text>
            <Button
              variant="text"
              size="sm"
              label={t("newDeal.addMilestone")}
              accessibilityLabel={t("newDeal.addMilestone")}
              onPress={addMilestone}
              leftIcon={<Plus size={15} color={theme.color.action} strokeWidth={2.3} />}
            />
          </View>

          {reconciliation.reconciles ? (
            <View style={styles.reconcileBanner}>
              <CircleCheck size={17} color={theme.status.paid.text} strokeWidth={2} />
              <Text variant="caption" style={styles.reconcileText}>
                {t("newDeal.reconciled", { total: reconciliation.totalLabel })}
              </Text>
            </View>
          ) : null}

          <View style={styles.milestones}>
            {fields.map((field, index) => (
              <MilestoneEditor
                key={field.id}
                control={control}
                index={index}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
                onTriggerTypeChange={(triggerType) => setValue(`milestones.${index}.triggerType`, triggerType, { shouldDirty: true, shouldValidate: true })}
                requiresConfirm={field.source === "spa_extracted"}
                confidence={field.confidence}
                isConfirmed={confirmedFieldIds.has(field.id)}
                onConfirm={() => confirmMilestone(field.id)}
              />
            ))}
          </View>
        </MotiView>

        {submitError ? (
          <Text variant="caption" style={styles.errorText}>
            {submitError}
          </Text>
        ) : null}

        <GoldButton
          label={isSaving ? t("newDeal.savingDeal") : unconfirmedAiFields.length > 0 ? t("newDeal.confirmToContinue", { done: fields.filter((f) => f.source === "spa_extracted").length - unconfirmedAiFields.length, total: fields.filter((f) => f.source === "spa_extracted").length }) : t("newDeal.saveDeal")}
          disabled={isSaving || isExtracting || unconfirmedAiFields.length > 0}
          onPress={handleSubmit(saveDeal)}
          style={[styles.saveButton, (isSaving || isExtracting || unconfirmedAiFields.length > 0) && styles.disabled]}
        />
      </ScrollView>
    </Screen>
  );
}

type MilestoneEditorProps = {
  control: ReturnType<typeof useForm<NewDealFormValues>>["control"];
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onTriggerTypeChange: (triggerType: MilestoneTrigger) => void;
  requiresConfirm: boolean;
  confidence: MilestoneConfidence | undefined;
  isConfirmed: boolean;
  onConfirm: () => void;
};

function MilestoneEditor({ control, index, canRemove, onRemove, onTriggerTypeChange, requiresConfirm, confidence, isConfirmed, onConfirm }: MilestoneEditorProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.milestoneCard, requiresConfirm && !isConfirmed && styles.milestoneCardNeedsConfirm]}>
      {requiresConfirm ? (
        <View style={styles.confidenceRow}>
          <Text variant="caption" style={[styles.confidenceBadge, confidence === "low" && styles.confidenceBadgeLow]}>
            {t(confidence === "low" ? "newDeal.confidenceLow" : confidence === "medium" ? "newDeal.confidenceMedium" : "newDeal.confidenceHigh")}
          </Text>
          {isConfirmed ? (
            <View style={styles.confirmedChip}>
              <CircleCheck size={13} color={theme.status.paid.text} strokeWidth={2.2} />
              <Text variant="caption" style={styles.confirmedChipText}>
                {t("newDeal.confirmed")}
              </Text>
            </View>
          ) : (
            <Button variant="text" size="sm" label={t("newDeal.confirmFigures")} onPress={onConfirm} />
          )}
        </View>
      ) : null}

      <View style={styles.milestoneTop}>
        <Controller
          control={control}
          name={`milestones.${index}.label`}
          render={({ field, fieldState }) => <Input label={t("newDeal.label")} placeholder={t("newDeal.labelPlaceholder")} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
        />
        {canRemove ? <IconButton icon={Trash2} label={t("newDeal.removeMilestone")} onPress={onRemove} style={styles.removeButton} /> : null}
      </View>

      <Controller
        control={control}
        name={`milestones.${index}.triggerType`}
        render={({ field }) => (
          <View style={styles.triggerRow}>
            {triggerOptions.map((option) => (
              <OptionChip key={option.value} label={t(option.labelKey)} selected={field.value === option.value} onPress={() => onTriggerTypeChange(option.value)} />
            ))}
          </View>
        )}
      />

      <View style={styles.milestoneGrid}>
        <Controller
          control={control}
          name={`milestones.${index}.percent`}
          render={({ field, fieldState }) => <Input label={t("newDeal.percent")} placeholder={t("newDeal.percentPlaceholder")} keyboardType="numeric" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
        />
        <Controller
          control={control}
          name={`milestones.${index}.amountAed`}
          render={({ field, fieldState }) => <Input label={t("newDeal.amountAed")} placeholder={t("newDeal.amountPlaceholder")} keyboardType="numeric" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
        />
      </View>
      <Controller
        control={control}
        name={`milestones.${index}.dueDate`}
        render={({ field, fieldState }) => <Input label={t("newDeal.dueDate")} placeholder={t("newDeal.dueDatePlaceholder")} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
      />
      <Controller
        control={control}
        name={`milestones.${index}.triggerValue`}
        render={({ field }) => <Input label={t("newDeal.trigger")} placeholder={t("newDeal.triggerPlaceholder")} value={field.value ?? ""} onChangeText={field.onChange} onBlur={field.onBlur} style={styles.compactInput} />}
      />
    </View>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    rtl: {
      direction: "rtl",
    },
    screen: {
      paddingBottom: 0,
    },
    scroll: {
      paddingBottom: t.space[8],
    },
    cancel: {
      alignSelf: "flex-start",
      marginBottom: t.space[3],
    },
    title: {
      marginBottom: t.space[4],
    },
    dropZone: {
      alignItems: "center",
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: t.color.action,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.selectedTint,
      padding: t.space[5],
      marginBottom: t.space[3],
    },
    dropTitle: {
      fontSize: 16,
      lineHeight: 20,
      marginTop: t.space[2],
    },
    dropText: {
      marginTop: t.space[1],
      textAlign: "center",
    },
    aiMessage: {
      color: t.status.paid.text,
      marginBottom: t.space[4],
    },
    planHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
      marginTop: t.space[2],
      marginBottom: t.space[3],
    },
    planTitle: {
      fontSize: 15,
      lineHeight: 20,
    },
    reconcileBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[2],
      borderWidth: 1,
      borderColor: t.status.paid.solid,
      borderRadius: t.radius.md,
      backgroundColor: t.status.paid.bg,
      padding: t.space[3],
      marginBottom: t.space[3],
    },
    reconcileText: {
      flex: 1,
      color: t.status.paid.text,
    },
    milestones: {
      gap: t.space[2],
    },
    milestoneCard: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.md,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[3],
    },
    milestoneCardNeedsConfirm: {
      borderColor: t.status.due.solid,
    },
    confidenceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[2],
      marginBottom: t.space[2],
    },
    confidenceBadge: {
      color: t.color.actionText,
      fontFamily: t.typography.family.uiSemi,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    confidenceBadgeLow: {
      color: t.status.due.text,
    },
    confirmedChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    confirmedChipText: {
      color: t.status.paid.text,
      fontFamily: t.typography.family.monoSemi,
    },
    milestoneTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.space[2],
    },
    milestoneGrid: {
      flexDirection: "row",
      gap: t.space[2],
    },
    compactInput: {
      minHeight: 44,
      paddingHorizontal: t.space[3],
      fontSize: 13,
    },
    removeButton: {
      marginTop: 22,
    },
    triggerRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.space[2],
      marginBottom: t.space[3],
    },
    saveButton: {
      marginTop: t.space[4],
    },
    errorText: {
      color: t.status.overdue.text,
      marginTop: t.space[3],
    },
    disabled: {
      opacity: 0.56,
    },
  });
