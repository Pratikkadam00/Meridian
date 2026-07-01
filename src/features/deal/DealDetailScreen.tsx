import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useRouter, type Href } from "expo-router";
import { Check, ChevronLeft, ChevronRight, Circle, Link2, MessageCircle } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { formatAedCompact, formatAedWhole } from "@/features/dashboard";
import { buildDealMessage, buildMilestoneMessage, buildWhatsAppShareUrl, type DealMessageTemplateKey } from "@/features/deal/dealMessages";
import { markMilestonePaidInDetail, type DealDetail, type DealPaymentMilestone } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { Button, GhostButton } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

type DealDetailScreenProps = {
  dealId: string;
};

const detailQueryKey = (dealId: string) => ["deal-detail", dealId] as const;

export function DealDetailScreen({ dealId }: DealDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isRTL } = useI18nControls();
  const { deals: dealsRepository } = useRepositories();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [poppingMilestoneId, setPoppingMilestoneId] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: detailQueryKey(dealId),
    queryFn: () => dealsRepository.getDealDetail(dealId),
  });

  const markPaidMutation = useMutation<DealDetail, Error, string, { previousDeal?: DealDetail }>({
    mutationFn: (milestoneId) => dealsRepository.markMilestonePaid(dealId, milestoneId),
    onMutate: async (milestoneId) => {
      await queryClient.cancelQueries({ queryKey: detailQueryKey(dealId) });
      const previousDeal = queryClient.getQueryData<DealDetail>(detailQueryKey(dealId));

      if (previousDeal) {
        queryClient.setQueryData(detailQueryKey(dealId), markMilestonePaidInDetail(previousDeal, milestoneId, t("deal.today")));
      }

      setPoppingMilestoneId(milestoneId);

      return { previousDeal };
    },
    onError: (_error, _milestoneId, context) => {
      if (context?.previousDeal) {
        queryClient.setQueryData(detailQueryKey(dealId), context.previousDeal);
      }
    },
    onSuccess: (updatedDeal) => {
      queryClient.setQueryData(detailQueryKey(dealId), updatedDeal);
      void queryClient.invalidateQueries({ queryKey: ["dashboard-deals"] });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    },
    onSettled: () => {
      setTimeout(() => setPoppingMilestoneId(null), 460);
    },
  });

  const markCommissionMutation = useMutation<DealDetail, Error, string>({
    mutationFn: (trancheId) => dealsRepository.markCommissionTranche(dealId, trancheId, "received"),
    onSuccess: (updatedDeal) => {
      queryClient.setQueryData(detailQueryKey(dealId), updatedDeal);
      void queryClient.invalidateQueries({ queryKey: ["commission-risk"] });
      void queryClient.invalidateQueries({ queryKey: ["portfolio-commission-tranches"] });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    },
  });

  const shareLinkMutation = useMutation<string, Error, void>({
    mutationFn: () => dealsRepository.getShareLink(dealId),
    onSuccess: (url) => {
      const message = t("dealMessages.portalLinkBody", { url });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      void Linking.openURL(buildWhatsAppShareUrl(message));
    },
  });

  const deal = detailQuery.data;
  const markableMilestoneId = useMemo(() => deal?.milestones.find((milestone) => milestone.status === "due" || milestone.status === "overdue")?.id ?? null, [deal?.milestones]);

  function markCommissionReceived(trancheId: string) {
    if (!markCommissionMutation.isPending) {
      markCommissionMutation.mutate(trancheId);
    }
  }

  function goBack() {
    router.back();
  }

  function markMilestonePaid(milestoneId: string) {
    if (!markPaidMutation.isPending) {
      markPaidMutation.mutate(milestoneId);
    }
  }

  // Post-sale client comms: same wa.me/?text=... pattern as the reminders
  // screen — no phone number needed, WhatsApp opens the broker's own contact
  // picker with the message pre-filled.
  function shareDealMessage(key: DealMessageTemplateKey) {
    if (!deal) {
      return;
    }
    const message = buildDealMessage(key, deal, t);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    void Linking.openURL(buildWhatsAppShareUrl(message));
  }

  function shareMilestone(milestone: DealPaymentMilestone) {
    if (!deal) {
      return;
    }
    const message = buildMilestoneMessage(milestone.status === "paid" ? "paidConfirmation" : "reminder", deal, milestone, t);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    void Linking.openURL(buildWhatsAppShareUrl(message));
  }

  if (detailQuery.isLoading) {
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

  if (!deal) {
    return (
      <Screen contentStyle={styles.screen}>
        <View style={styles.centerState}>
          <Text variant="h1" style={styles.emptyTitle}>
            {t("deal.unavailableTitle")}
          </Text>
          <Text variant="body" muted style={styles.emptyBody}>
            {detailQuery.error instanceof Error ? detailQuery.error.message : t("deal.unavailableBody")}
          </Text>
          <GhostButton label={t("deal.backToPortfolio")} onPress={goBack} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360 }}>
          <View style={styles.topRow}>
            <Button
              variant="text"
              size="md"
              label={t("deal.portfolio")}
              accessibilityLabel={t("deal.backToPortfolio")}
              onPress={goBack}
              leftIcon={isRTL ? <ChevronRight size={18} color={theme.color.action} /> : <ChevronLeft size={18} color={theme.color.action} />}
            />
            <Button
              variant="text"
              size="md"
              label={t("deal.documents")}
              accessibilityLabel={t("deal.documentsA11y")}
              onPress={() => router.push({ pathname: "/documents", params: { dealId } } as unknown as Href)}
            />
          </View>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 80 }}>
          <View style={styles.heroBlock}>
            <Text variant="eyebrow">
              {t("deal.developerLocation", { developer: deal.developer, location: deal.locationLabel })}
            </Text>
            <Text variant="h1" style={styles.title} numberOfLines={2}>
              {deal.projectName}
            </Text>
            <Text variant="body" muted style={styles.metaLine}>
              {t("deal.buyerHandover", { buyer: deal.buyerName, handover: deal.handoverLabel })}
            </Text>
          </View>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 160 }}>
          <PaidToDatePanel deal={deal} />
        </MotiView>

        {markPaidMutation.isError ? (
          <Text variant="caption" style={styles.error}>
            {markPaidMutation.error.message}
          </Text>
        ) : null}

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 240 }}>
          <View style={styles.towerPanel}>
            <Text variant="cardTitle" style={styles.towerTitle}>
              {t("deal.paymentPlan")}
            </Text>
            {deal.milestones.map((milestone, index) => (
              <PaymentMilestoneRow
                key={milestone.id}
                milestone={milestone}
                isLast={index === deal.milestones.length - 1}
                isPopping={poppingMilestoneId === milestone.id}
                isPending={markPaidMutation.isPending && markPaidMutation.variables === milestone.id}
                canMarkPaid={markableMilestoneId === milestone.id}
                onMarkPaid={markMilestonePaid}
                onShare={() => shareMilestone(milestone)}
              />
            ))}
          </View>
        </MotiView>

        {markCommissionMutation.isError ? (
          <Text variant="caption" style={styles.error}>
            {markCommissionMutation.error.message}
          </Text>
        ) : null}

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 320 }}>
          <CommissionPanel
            commission={deal.commission}
            pendingTrancheId={markCommissionMutation.isPending ? markCommissionMutation.variables ?? null : null}
            onMarkReceived={markCommissionReceived}
            onEdit={() => router.push({ pathname: "/commission", params: { dealId } } as unknown as Href)}
          />
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 380 }}>
          <ClientUpdatesPanel onShare={shareDealMessage} onSharePortal={() => shareLinkMutation.mutate()} isSharingPortal={shareLinkMutation.isPending} />
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

function ClientUpdatesPanel({
  onShare,
  onSharePortal,
  isSharingPortal,
}: {
  onShare: (key: DealMessageTemplateKey) => void;
  onSharePortal: () => void;
  isSharingPortal: boolean;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const templates: { key: DealMessageTemplateKey; labelKey: string }[] = [
    { key: "recap", labelKey: "dealMessages.recapLabel" },
    { key: "progressUpdate", labelKey: "dealMessages.progressLabel" },
    { key: "handoverApproaching", labelKey: "dealMessages.handoverLabel" },
  ];

  return (
    <View style={styles.commissionPanel}>
      <Text variant="cardTitle" style={styles.towerTitle}>
        {t("dealMessages.panelTitle")}
      </Text>
      <Text variant="caption" muted style={styles.clientUpdatesLede}>
        {t("dealMessages.panelLede")}
      </Text>
      <PressableScale
        accessibilityLabel={t("dealMessages.portalLabel")}
        disabled={isSharingPortal}
        focusRadius={theme.radius.md}
        pressScale={0.98}
        haptic
        onPress={onSharePortal}
        pressableStyle={styles.clientUpdateRow}
      >
        <Link2 size={17} color={theme.color.action} strokeWidth={2} />
        <Text variant="body" style={styles.clientUpdateLabel}>
          {isSharingPortal ? t("dealMessages.portalLoading") : t("dealMessages.portalLabel")}
        </Text>
      </PressableScale>
      {templates.map((template) => (
        <PressableScale
          key={template.key}
          accessibilityLabel={t(template.labelKey)}
          focusRadius={theme.radius.md}
          pressScale={0.98}
          haptic
          onPress={() => onShare(template.key)}
          pressableStyle={styles.clientUpdateRow}
        >
          <MessageCircle size={17} color={theme.color.action} strokeWidth={2} />
          <Text variant="body" style={styles.clientUpdateLabel}>
            {t(template.labelKey)}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

function CommissionPanel({
  commission,
  pendingTrancheId,
  onMarkReceived,
  onEdit,
}: {
  commission: DealDetail["commission"];
  pendingTrancheId: string | null;
  onMarkReceived: (trancheId: string) => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const hasCommission = commission.tranches.length > 0 || commission.ratePercent != null;

  return (
    <View style={styles.commissionPanel}>
      <View style={styles.commissionHeader}>
        <Text variant="cardTitle" style={styles.towerTitle}>
          {t("deal.commissionTitle")}
        </Text>
        <Button
          variant="text"
          size="md"
          label={hasCommission ? t("deal.commissionEdit") : t("deal.commissionAdd")}
          onPress={onEdit}
        />
      </View>

      {hasCommission ? (
        <>
          <View style={styles.commissionTotals}>
            <View style={styles.commissionTotalCell}>
              <Text variant="caption" muted>
                {t("deal.commissionTotal")}
              </Text>
              <Text variant="cardTitle" style={styles.commissionTotalValue}>
                {t("currency.aed")} {formatAedWhole(commission.totalAed)}
              </Text>
            </View>
            <View style={styles.commissionTotalCell}>
              <Text variant="caption" muted>
                {t("deal.commissionOutstanding")}
              </Text>
              <Text variant="cardTitle" style={[styles.commissionTotalValue, commission.outstandingAed !== "0" && styles.commissionOutstandingActive]}>
                {t("currency.aed")} {formatAedWhole(commission.outstandingAed)}
              </Text>
            </View>
          </View>

          {commission.tranches.map((tranche) => (
            <View key={tranche.id} style={styles.commissionTrancheRow}>
              <View style={styles.commissionTrancheCopy}>
                <Text variant="caption" numberOfLines={1}>
                  {tranche.label}
                </Text>
                <Text variant="mono" muted>
                  {t("currency.aed")} {formatAedWhole(tranche.amountAed)} · {tranche.percent}%
                </Text>
              </View>
              {tranche.status === "received" ? (
                <Text variant="mono" style={styles.commissionReceived}>
                  {t("deal.commissionReceivedOn", { date: tranche.receivedDateLabel ?? "" })}
                </Text>
              ) : (
                <PressableScale
                  accessibilityLabel={t("deal.commissionMarkReceived")}
                  focusRadius={999}
                  pressScale={0.97}
                  haptic
                  onPress={() => onMarkReceived(tranche.id)}
                  pressableStyle={styles.commissionMarkButton}
                >
                  <Text variant="mono" style={styles.commissionMarkText}>
                    {pendingTrancheId === tranche.id ? t("deal.saving") : t("deal.commissionMarkReceived")}
                  </Text>
                </PressableScale>
              )}
            </View>
          ))}
        </>
      ) : (
        <Text variant="body" muted>
          {t("deal.commissionEmpty")}
        </Text>
      )}
    </View>
  );
}

function PaidToDatePanel({ deal }: { deal: DealDetail }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = reducedMotion ? withTiming(deal.paidPercent, { duration: 120 }) : withTiming(deal.paidPercent, { duration: 700 });
  }, [deal.paidPercent, progress, reducedMotion]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(progress.value, 100))}%`,
  }));

  return (
    <View style={styles.paidPanel}>
      <Text variant="caption" muted style={styles.panelLabel}>
        {t("deal.paidToDate")}
      </Text>
      <Text variant="cardTitle" style={styles.paidAmount}>
        {formatAedCompact(deal.paidToDateAed)} <Text variant="caption" muted>/ {formatAedCompact(deal.totalValueAed, { symbol: false })}</Text>
      </Text>
      <View style={styles.detailProgressTrack}>
        <Animated.View style={[styles.detailProgressFill, progressStyle]} />
      </View>
    </View>
  );
}

type PaymentMilestoneRowProps = {
  milestone: DealPaymentMilestone;
  isLast: boolean;
  isPopping: boolean;
  isPending: boolean;
  canMarkPaid: boolean;
  onMarkPaid: (milestoneId: string) => void;
  onShare: () => void;
};

function PaymentMilestoneRow({ milestone, isLast, isPopping, isPending, canMarkPaid, onMarkPaid, onShare }: PaymentMilestoneRowProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const reducedMotion = useReducedMotion();
  const nodeScale = useSharedValue(1);

  useEffect(() => {
    if (!isPopping) {
      return;
    }

    if (reducedMotion) {
      nodeScale.value = withTiming(1, { duration: 120 });
      return;
    }

    nodeScale.value = withSpring(1.18, { damping: 12, stiffness: 180 }, () => {
      nodeScale.value = withSpring(1, { damping: 12, stiffness: 180 });
    });
  }, [isPopping, nodeScale, reducedMotion]);

  const nodeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nodeScale.value }],
  }));

  const isDone = milestone.status === "paid";
  const isNow = milestone.status === "due" || milestone.status === "overdue";

  return (
    <View style={[styles.milestoneRow, isLast && styles.milestoneRowLast]}>
      <Animated.View style={[styles.node, isDone && styles.nodeDone, isNow && styles.nodeNow, nodeStyle]}>
        {isDone ? <Check size={11} color={theme.color.textOnBrand} strokeWidth={3} /> : isNow ? <Circle size={7} color={theme.color.accent} fill={theme.color.accent} strokeWidth={0} /> : null}
      </Animated.View>
      <Text variant="cardTitle" style={styles.milestonePercent}>
        {t("deal.milestonePercent", { percent: milestone.percent, trigger: milestone.triggerLabel })}
      </Text>
      <Text variant="caption" style={styles.milestoneLabel} numberOfLines={2}>
        {milestone.label}
      </Text>
      <View style={styles.milestoneMeta}>
        <Text variant="mono" muted>
          {t("currency.aed")} <Text variant="mono">{formatAedWhole(milestone.amountAed)}</Text>
        </Text>
        {canMarkPaid ? (
          <PressableScale
            accessibilityLabel={t("deal.markPaidAccessibility", { label: milestone.label })}
            disabled={isPending}
            haptic
            focusRadius={999}
            pressScale={0.98}
            pressableStyle={styles.markPaidButton}
            onPress={() => onMarkPaid(milestone.id)}
          >
            <Text variant="mono" style={styles.markPaidText}>
              {isPending
                ? t("deal.saving")
                : milestone.status === "overdue"
                  ? t("deal.overdueMarkPaid")
                  : t("deal.dueMarkPaid", { date: milestone.dueDateLabel })}
            </Text>
          </PressableScale>
        ) : (
          <Text variant="mono" style={[styles.milestoneStatus, isDone && styles.statusDone, milestone.status === "overdue" && styles.statusOver, milestone.status === "due" && styles.statusDue]}>
            {isDone
              ? t("deal.paidOn", { date: milestone.paidDateLabel ?? t("deal.done") })
              : milestone.status === "overdue"
                ? t("deal.overdueOn", { date: milestone.dueDateLabel })
                : milestone.status === "due"
                  ? t("deal.dueOn", { date: milestone.dueDateLabel })
                  : milestone.dueDateLabel}
          </Text>
        )}
        <IconButton icon={MessageCircle} label={t("dealMessages.shareMilestoneA11y", { label: milestone.label })} onPress={onShare} variant="circle" />
      </View>
    </View>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    screen: {
      paddingBottom: 0,
    },
    rtl: {
      direction: "rtl",
    },
    scroll: {
      paddingBottom: t.sizing.tabBarClearance,
    },
    centerState: {
      flex: 1,
      justifyContent: "center",
    },
    emptyTitle: {
      marginBottom: t.space[3],
    },
    emptyBody: {
      marginBottom: t.space[5],
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: t.space[3],
    },
    heroBlock: {
      marginBottom: t.space[4],
    },
    title: {
      marginTop: 6,
      marginBottom: 3,
    },
    metaLine: {
      fontSize: 13,
      lineHeight: 19,
    },
    paidPanel: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[4],
      marginBottom: t.space[4],
      ...t.elevation.sm,
    },
    panelLabel: {
      marginBottom: t.space[2],
    },
    paidAmount: {
      fontSize: 25,
      lineHeight: 31,
    },
    detailProgressTrack: {
      height: 8,
      overflow: "hidden",
      borderRadius: t.radius.pill,
      backgroundColor: t.color.surfaceSunk,
      marginTop: t.space[3],
    },
    detailProgressFill: {
      height: "100%",
      borderRadius: t.radius.pill,
      backgroundColor: t.color.action,
    },
    error: {
      color: t.status.overdue.text,
      marginBottom: t.space[3],
    },
    towerPanel: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: 20,
      ...t.elevation.sm,
    },
    towerTitle: {
      fontSize: 15,
      lineHeight: 20,
      marginBottom: t.space[4],
    },
    milestoneRow: {
      position: "relative",
      borderLeftWidth: 2,
      borderLeftColor: t.color.borderHair,
      paddingLeft: 36,
      paddingBottom: t.space[5],
    },
    milestoneRowLast: {
      borderLeftColor: "transparent",
      paddingBottom: 0,
    },
    node: {
      position: "absolute",
      left: -11,
      top: 0,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: t.color.borderStrong,
      borderRadius: 7,
      backgroundColor: t.color.surfaceSunk,
    },
    nodeDone: {
      borderColor: t.color.action,
      backgroundColor: t.color.action,
    },
    nodeNow: {
      borderColor: t.color.accent,
      shadowColor: t.color.accent,
      shadowOpacity: 0.28,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      elevation: 7,
    },
    milestonePercent: {
      fontSize: 14,
      lineHeight: 18,
    },
    milestoneLabel: {
      marginTop: 1,
      marginBottom: t.space[1],
    },
    milestoneMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: t.space[3],
    },
    milestoneStatus: {
      color: t.color.textSecondary,
    },
    statusDone: {
      color: t.color.textPrimary,
    },
    statusDue: {
      color: t.status.due.text,
    },
    statusOver: {
      color: t.status.overdue.text,
    },
    markPaidButton: {
      minHeight: 44,
      justifyContent: "center",
      borderRadius: t.radius.pill,
      backgroundColor: t.status.due.bg,
      paddingHorizontal: t.space[3],
    },
    markPaidText: {
      color: t.status.due.text,
      fontFamily: t.typography.family.monoSemi,
    },
    commissionPanel: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: 20,
      marginTop: t.space[4],
      ...t.elevation.sm,
    },
    commissionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
    },
    commissionTotals: {
      flexDirection: "row",
      gap: t.space[4],
      marginBottom: t.space[2],
    },
    commissionTotalCell: {
      flex: 1,
    },
    commissionTotalValue: {
      fontSize: 18,
      lineHeight: 23,
      marginTop: t.space[1],
    },
    commissionOutstandingActive: {
      color: t.color.accentText,
    },
    commissionTrancheRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
      borderTopWidth: 1,
      borderTopColor: t.color.borderFaint,
      paddingVertical: t.space[3],
    },
    commissionTrancheCopy: {
      flex: 1,
      gap: 2,
    },
    commissionReceived: {
      color: t.status.paid.text,
      fontFamily: t.typography.family.monoSemi,
    },
    commissionMarkButton: {
      minHeight: 44,
      justifyContent: "center",
      borderRadius: t.radius.pill,
      backgroundColor: t.status.due.bg,
      paddingHorizontal: t.space[3],
    },
    commissionMarkText: {
      color: t.status.due.text,
      fontFamily: t.typography.family.monoSemi,
    },
    clientUpdatesLede: {
      marginBottom: t.space[3],
    },
    clientUpdateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[3],
      minHeight: 44,
      borderTopWidth: 1,
      borderTopColor: t.color.borderFaint,
      paddingVertical: t.space[2],
    },
    clientUpdateLabel: {
      flex: 1,
    },
  });
