import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Decimal } from "decimal.js";
import { router } from "expo-router";
import { Plus, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { formatAedWhole } from "@/features/dashboard";
import type { CommissionTrancheInput, DealDetail } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { Button, GhostButton, GoldButton } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { Input } from "@/shared/ui/Input";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

type DraftTranche = { id: string | null; label: string; percent: string };

const detailQueryKey = (dealId: string) => ["deal-detail", dealId] as const;

// A defensible default split a broker can edit — NOT a hardcoded assumption about
// any developer's terms (the percentages are theirs to change).
const DEFAULT_TRANCHES: DraftTranche[] = [
  { id: null, label: "On booking", percent: "50" },
  { id: null, label: "After DLD", percent: "25" },
  { id: null, label: "On handover", percent: "25" },
];

function stripNumber(value: string) {
  return value.replace(/,/g, "").trim();
}

export function CommissionEditorScreen({ dealId }: { dealId: string }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const { deals: dealsRepository } = useRepositories();

  const detailQuery = useQuery({
    queryKey: detailQueryKey(dealId),
    queryFn: () => dealsRepository.getDealDetail(dealId),
  });

  if (detailQuery.isLoading || !detailQuery.data) {
    return (
      <Screen contentStyle={styles.screen}>
        <View style={styles.centerState}>
          <Text variant="mono" muted>
            {t("deal.loadingDeal")}
          </Text>
        </View>
      </Screen>
    );
  }

  // Mount the form only once the deal is loaded, so its state initializes
  // synchronously from the deal (no set-state-in-effect prefill).
  return <CommissionForm deal={detailQuery.data} dealId={dealId} />;
}

function CommissionForm({ deal, dealId }: { deal: DealDetail; dealId: string }) {
  const { t } = useTranslation();
  const { isRTL } = useI18nControls();
  const { deals: dealsRepository } = useRepositories();
  const queryClient = useQueryClient();
  const styles = useThemedStyles(makeStyles);

  const [rate, setRate] = useState(deal.commission.ratePercent ?? "");
  const [tranches, setTranches] = useState<DraftTranche[]>(
    deal.commission.tranches.length > 0
      ? deal.commission.tranches.map((tranche) => ({ id: tranche.id, label: tranche.label, percent: tranche.percent }))
      : DEFAULT_TRANCHES,
  );

  const totalCommission = useMemo(() => {
    try {
      return new Decimal(deal.totalValueAed || "0").times(new Decimal(stripNumber(rate) || "0").dividedBy(100));
    } catch {
      return new Decimal(0);
    }
  }, [rate, deal.totalValueAed]);

  const percentSum = useMemo(
    () =>
      tranches.reduce((sum, tranche) => {
        try {
          return sum.plus(new Decimal(stripNumber(tranche.percent) || "0"));
        } catch {
          return sum;
        }
      }, new Decimal(0)),
    [tranches],
  );

  const reconciles = percentSum.minus(100).abs().lessThanOrEqualTo(1);
  const labelsValid = tranches.every((tranche) => tranche.label.trim().length > 0);
  const canSave = tranches.length > 0 && reconciles && labelsValid;

  const saveMutation = useMutation<DealDetail, Error, void>({
    mutationFn: () => {
      const payload: CommissionTrancheInput[] = tranches.map((tranche) => {
        const percent = new Decimal(stripNumber(tranche.percent) || "0");
        return {
          id: tranche.id,
          label: tranche.label.trim(),
          percent: percent.toString(),
          amountAed: totalCommission.times(percent.dividedBy(100)).toDecimalPlaces(0).toFixed(0),
          expectedDate: null,
        };
      });
      const cleanRate = stripNumber(rate);
      return dealsRepository.setDealCommission(dealId, cleanRate ? cleanRate : null, payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(detailQueryKey(dealId), updated);
      void queryClient.invalidateQueries({ queryKey: ["commission-risk"] });
      void queryClient.invalidateQueries({ queryKey: ["portfolio-commission-tranches"] });
      router.back();
    },
  });

  function updateTranche(index: number, patch: Partial<DraftTranche>) {
    setTranches((current) => current.map((tranche, i) => (i === index ? { ...tranche, ...patch } : tranche)));
  }

  function trancheAmount(percent: string) {
    return formatAedWhole(totalCommission.times(new Decimal(stripNumber(percent) || "0").dividedBy(100)).toDecimalPlaces(0).toFixed(0));
  }

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="eyebrow">{t("commission.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("commission.editorTitle")}
        </Text>
        <Text variant="body" muted style={styles.lede}>
          {t("commission.editorLede", { project: deal.projectName })}
        </Text>

        <Input label={t("commission.rateLabel")} placeholder={t("commission.ratePlaceholder")} keyboardType="numeric" value={rate} onChangeText={setRate} />

        <View style={styles.totalRow}>
          <Text variant="caption" muted>
            {t("commission.totalLabel")}
          </Text>
          <Text variant="cardTitle" style={styles.totalValue}>
            {t("currency.aed")} {formatAedWhole(totalCommission.toDecimalPlaces(0).toFixed(0))}
          </Text>
        </View>

        <Text variant="cardTitle" style={styles.tranchesTitle}>
          {t("commission.tranchesTitle")}
        </Text>

        {tranches.map((tranche, index) => (
          <View key={index} style={styles.trancheCard}>
            <View style={styles.trancheTop}>
              <View style={styles.trancheLabelField}>
                <Input
                  label={t("commission.trancheLabel")}
                  placeholder={t("commission.trancheLabelPlaceholder")}
                  value={tranche.label}
                  // Matches commission_tranches.label's length(label) <= 120
                  // check — cap input here instead of failing on save.
                  maxLength={120}
                  onChangeText={(value) => updateTranche(index, { label: value })}
                />
              </View>
              <IconButton icon={Trash2} label={t("commission.removeTranche")} onPress={() => setTranches((current) => current.filter((_, i) => i !== index))} />
            </View>
            <View style={styles.trancheBottom}>
              <View style={styles.tranchePercentField}>
                <Input
                  label={t("commission.tranchePercent")}
                  placeholder={t("commission.ratePlaceholder")}
                  keyboardType="numeric"
                  value={tranche.percent}
                  onChangeText={(value) => updateTranche(index, { percent: value })}
                />
              </View>
              <Text variant="mono" muted style={styles.trancheAmount}>
                {t("currency.aed")} {trancheAmount(tranche.percent)}
              </Text>
            </View>
          </View>
        ))}

        <Button
          variant="text"
          size="md"
          label={t("commission.addTranche")}
          leftIcon={<Plus size={15} strokeWidth={2.3} />}
          onPress={() => setTranches((current) => [...current, { id: null, label: "", percent: "" }])}
          style={styles.addButton}
        />

        <Text variant="caption" style={[styles.sumLine, !reconciles && styles.sumLineError]}>
          {t("commission.sumLine", { percent: percentSum.toDecimalPlaces(2).toString() })}
        </Text>

        {saveMutation.isError ? (
          <Text variant="caption" style={styles.error}>
            {saveMutation.error.message}
          </Text>
        ) : null}

        <GoldButton label={saveMutation.isPending ? t("commission.saving") : t("commission.save")} disabled={!canSave || saveMutation.isPending} onPress={() => saveMutation.mutate()} />
        <GhostButton label={t("commission.cancel")} onPress={() => router.back()} style={styles.cancelButton} />
      </ScrollView>
    </Screen>
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
    centerState: {
      flex: 1,
      justifyContent: "center",
    },
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[2],
    },
    lede: {
      marginBottom: t.space[5],
    },
    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
      marginTop: t.space[1],
      marginBottom: t.space[5],
    },
    totalValue: {
      fontSize: 18,
      lineHeight: 23,
    },
    tranchesTitle: {
      fontSize: 15,
      lineHeight: 20,
      marginBottom: t.space[3],
    },
    trancheCard: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[4],
      marginBottom: t.space[3],
    },
    trancheTop: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: t.space[3],
    },
    trancheLabelField: {
      flex: 1,
    },
    trancheBottom: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[3],
    },
    tranchePercentField: {
      flex: 1,
    },
    trancheAmount: {
      flex: 1,
    },
    addButton: {
      alignSelf: "flex-start",
      marginBottom: t.space[4],
    },
    sumLine: {
      color: t.color.textSecondary,
      marginBottom: t.space[4],
    },
    sumLineError: {
      color: t.status.overdue.text,
    },
    error: {
      color: t.status.overdue.text,
      marginBottom: t.space[3],
    },
    cancelButton: {
      marginTop: t.space[3],
    },
  });
