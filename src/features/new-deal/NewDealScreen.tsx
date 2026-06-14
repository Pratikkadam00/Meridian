import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FileUp, Plus, Trash2 } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import type { DealDetail, NewDealDocumentInput, SpaExtractionInput } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import type { MilestoneTrigger } from "@/shared/data/database.types";
import { useFeatureFlag } from "@/shared/featureFlags/FeatureFlagProvider";
import { captureNonFatalError, finishPerformanceJourney, startPerformanceJourney } from "@/shared/observability/sentry";
import { tokens } from "@/shared/theme/tokens";
import { GoldButton } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

import { defaultMilestone, milestoneInputToForm, newDealFormSchema, toCreateDealInput, type NewDealFormValues } from "./newDealSchema";

type PendingSpaDocument = NewDealDocumentInput & {
  dealId: string;
};

const triggerOptions: { label: string; value: MilestoneTrigger }[] = [
  { label: "Booking", value: "booking" },
  { label: "DLD", value: "registration" },
  { label: "Build", value: "construction" },
  { label: "Handover", value: "handover" },
];

export function NewDealScreen() {
  const queryClient = useQueryClient();
  const { deals: dealsRepository } = useRepositories();
  const aiSpaExtractionEnabled = useFeatureFlag("ai_spa_extraction");
  const [pendingSpaDocument, setPendingSpaDocument] = useState<PendingSpaDocument | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

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
      setAiMessage(`AI filled ${result.milestones.length} milestones. Review the plan before saving.`);
    },
    onError: (error) => {
      captureNonFatalError("spa_extraction_failed_but_app_continued", error, { surface: "new_deal" });
      setAiMessage(error instanceof Error ? error.message : "SPA extraction failed. You can still enter the plan manually.");
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
        setAiMessage("Could not read the selected PDF. You can still enter the plan manually.");
        return;
      }

      extractSpaMutation.mutate({
        fileUri: asset.uri,
        fileName: asset.name || "SPA.pdf",
        mimeType: asset.mimeType || "application/pdf",
      });
    } catch (error) {
      captureNonFatalError("spa_document_picker_failed", error, { surface: "new_deal" });
      setAiMessage("Could not open the file picker. You can still enter the plan manually.");
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
    <Screen contentStyle={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel new deal" onPress={() => router.back()} style={styles.cancel}>
            <Text variant="caption" style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
          <Text variant="h1" style={styles.title}>
            New deal
          </Text>
        </MotiView>

        {aiSpaExtractionEnabled ? (
          <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 80 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Upload SPA PDF" disabled={isExtracting} onPress={pickSpaPdf} style={({ pressed }) => [styles.dropZone, pressed && styles.pressed, isExtracting && styles.disabled]}>
              <FileUp size={24} color={tokens.colors.goldBright} strokeWidth={2.1} />
              <Text variant="cardTitle" style={styles.dropTitle}>
                Drop the SPA PDF
              </Text>
              <Text variant="caption" muted style={styles.dropText}>
                {isExtracting ? "Reading payment plan" : "We'll read it and fill the payment plan"}
              </Text>
            </Pressable>
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
            render={({ field, fieldState }) => <Input label="Project" placeholder="Marina Vista - 2BR" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
          <Controller
            control={control}
            name="developer"
            render={({ field, fieldState }) => <Input label="Developer" placeholder="Emaar" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
          <Controller
            control={control}
            name="buyerName"
            render={({ field, fieldState }) => <Input label="Buyer name" placeholder="Omar Al-Farsi" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
          <Controller
            control={control}
            name="totalValueAed"
            render={({ field, fieldState }) => <Input label="Total value (AED)" placeholder="3,200,000" keyboardType="numeric" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />}
          />
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 240 }}>
          <View style={styles.planHeader}>
            <Text variant="cardTitle" style={styles.planTitle}>
              Payment plan
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Add milestone" onPress={addMilestone} style={({ pressed }) => [styles.addMilestone, pressed && styles.pressed]}>
              <Plus size={15} color={tokens.colors.accent} strokeWidth={2.3} />
              <Text variant="caption" style={styles.addText}>
                Add milestone
              </Text>
            </Pressable>
          </View>

          <View style={styles.milestones}>
            {fields.map((field, index) => (
              <MilestoneEditor
                key={field.id}
                control={control}
                index={index}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
                onTriggerTypeChange={(triggerType) => setValue(`milestones.${index}.triggerType`, triggerType, { shouldDirty: true, shouldValidate: true })}
              />
            ))}
          </View>
        </MotiView>

        {submitError ? (
          <Text variant="caption" style={styles.errorText}>
            {submitError}
          </Text>
        ) : null}

        <GoldButton label={isSaving ? "Saving deal" : "Save deal"} disabled={isSaving || isExtracting} onPress={handleSubmit(saveDeal)} style={[styles.saveButton, (isSaving || isExtracting) && styles.disabled]} />
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
};

function MilestoneEditor({ control, index, canRemove, onRemove, onTriggerTypeChange }: MilestoneEditorProps) {
  return (
    <View style={styles.milestoneCard}>
      <View style={styles.milestoneTop}>
        <Controller
          control={control}
          name={`milestones.${index}.label`}
          render={({ field, fieldState }) => <Input label="Label" placeholder="Down payment" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
        />
        {canRemove ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Remove milestone" onPress={onRemove} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
            <Trash2 size={17} color={tokens.colors.over} strokeWidth={2.1} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.triggerRow}>
        {triggerOptions.map((option) => (
          <Controller
            key={option.value}
            control={control}
            name={`milestones.${index}.triggerType`}
            render={({ field }) => (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: field.value === option.value }} onPress={() => onTriggerTypeChange(option.value)} style={({ pressed }) => [styles.triggerChip, field.value === option.value && styles.triggerChipSelected, pressed && styles.pressed]}>
                <Text variant="caption" style={[styles.triggerChipText, field.value === option.value && styles.triggerChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            )}
          />
        ))}
      </View>

      <View style={styles.milestoneGrid}>
        <Controller
          control={control}
          name={`milestones.${index}.percent`}
          render={({ field, fieldState }) => <Input label="%" placeholder="20" keyboardType="numeric" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
        />
        <Controller
          control={control}
          name={`milestones.${index}.amountAed`}
          render={({ field, fieldState }) => <Input label="AED" placeholder="640,000" keyboardType="numeric" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
        />
      </View>
      <Controller
        control={control}
        name={`milestones.${index}.dueDate`}
        render={({ field, fieldState }) => <Input label="Due date" placeholder="2026-06-19" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} style={styles.compactInput} />}
      />
      <Controller
        control={control}
        name={`milestones.${index}.triggerValue`}
        render={({ field }) => <Input label="Trigger" placeholder="40% built" value={field.value ?? ""} onChangeText={field.onChange} onBlur={field.onBlur} style={styles.compactInput} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  scroll: {
    paddingBottom: tokens.spacing[32],
  },
  cancel: {
    minHeight: 32,
    alignSelf: "flex-start",
    justifyContent: "center",
    marginBottom: tokens.spacing[12],
  },
  cancelText: {
    color: tokens.colors.accent,
    fontFamily: tokens.font.bodySemi,
  },
  title: {
    marginBottom: tokens.spacing[16],
  },
  dropZone: {
    alignItems: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: tokens.colors.goldHairline,
    borderRadius: 16,
    backgroundColor: tokens.colors.goldTint,
    padding: tokens.spacing[22],
    marginBottom: tokens.spacing[12],
  },
  dropTitle: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: tokens.spacing[8],
  },
  dropText: {
    marginTop: tokens.spacing[4],
    textAlign: "center",
  },
  aiMessage: {
    color: tokens.colors.ok,
    marginBottom: tokens.spacing[16],
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[12],
  },
  planTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  addMilestone: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[4],
  },
  addText: {
    color: tokens.colors.accent,
    fontFamily: tokens.font.bodySemi,
  },
  milestones: {
    gap: tokens.spacing[8],
  },
  milestoneCard: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: 14,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[12],
  },
  milestoneTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing[8],
  },
  milestoneGrid: {
    flexDirection: "row",
    gap: tokens.spacing[8],
  },
  compactInput: {
    minHeight: 44,
    paddingHorizontal: tokens.spacing[12],
    fontSize: 13,
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.field,
    backgroundColor: tokens.colors.panel2,
    marginTop: 25,
  },
  triggerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[8],
    marginBottom: tokens.spacing[12],
  },
  triggerChip: {
    minHeight: 34,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: 11,
    backgroundColor: tokens.colors.panel2,
    paddingHorizontal: tokens.spacing[12],
  },
  triggerChipSelected: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.goldTint,
  },
  triggerChipText: {
    color: tokens.colors.muted,
  },
  triggerChipTextSelected: {
    color: tokens.colors.ink,
  },
  saveButton: {
    marginTop: tokens.spacing[16],
  },
  errorText: {
    color: tokens.colors.over,
    marginTop: tokens.spacing[12],
  },
  disabled: {
    opacity: 0.56,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
