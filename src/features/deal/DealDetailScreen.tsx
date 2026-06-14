import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Check, ChevronLeft, ChevronRight, Circle } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { formatAedCompact, formatAedWhole } from "@/features/dashboard";
import { markMilestonePaidInDetail, type DealDetail, type DealPaymentMilestone } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { tokens } from "@/shared/theme/tokens";
import { Button, GhostButton } from "@/shared/ui/Button";
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
        queryClient.setQueryData(detailQueryKey(dealId), markMilestonePaidInDetail(previousDeal, milestoneId, "Today"));
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

  const deal = detailQuery.data;
  const markableMilestoneId = useMemo(() => deal?.milestones.find((milestone) => milestone.status === "due" || milestone.status === "overdue")?.id ?? null, [deal?.milestones]);

  function goBack() {
    router.back();
  }

  function markMilestonePaid(milestoneId: string) {
    if (!markPaidMutation.isPending) {
      markPaidMutation.mutate(milestoneId);
    }
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
          <Button
            variant="text"
            size="md"
            label={t("deal.portfolio")}
            accessibilityLabel={t("deal.backToPortfolio")}
            onPress={goBack}
            leftIcon={isRTL ? <ChevronRight size={18} color={tokens.colors.accent} /> : <ChevronLeft size={18} color={tokens.colors.accent} />}
            style={styles.backButton}
          />
        </MotiView>

        <Animated.View sharedTransitionTag={`deal-card-${deal.id}`}>
          <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 80 }}>
            <View style={styles.heroBlock}>
              <Text variant="eyebrow">
                {t("deal.developerLocation", { developer: deal.developer, location: deal.locationLabel })}
              </Text>
              <Text variant="h1" style={styles.title}>
                {deal.projectName}
              </Text>
              <Text variant="body" muted style={styles.metaLine}>
                {t("deal.buyerHandover", { buyer: deal.buyerName, handover: deal.handoverLabel })}
              </Text>
            </View>
          </MotiView>
        </Animated.View>

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
              />
            ))}
          </View>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

function PaidToDatePanel({ deal }: { deal: DealDetail }) {
  const { t } = useTranslation();
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
        {formatAedCompact(deal.paidToDateAed)} <Text variant="caption" muted>/ {formatAedCompact(deal.totalValueAed).replace("AED ", "")}</Text>
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
};

function PaymentMilestoneRow({ milestone, isLast, isPopping, isPending, canMarkPaid, onMarkPaid }: PaymentMilestoneRowProps) {
  const { t } = useTranslation();
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
        {isDone ? <Check size={11} color={tokens.colors.goldInk} strokeWidth={3} /> : isNow ? <Circle size={7} color={tokens.colors.due} fill={tokens.colors.due} strokeWidth={0} /> : null}
      </Animated.View>
      <Text variant="cardTitle" style={styles.milestonePercent}>
        {t("deal.milestonePercent", { percent: milestone.percent, trigger: milestone.triggerLabel })}
      </Text>
      <Text variant="caption" style={styles.milestoneLabel}>
        {milestone.label}
      </Text>
      <View style={styles.milestoneMeta}>
        <Text variant="mono" muted>
          AED <Text variant="mono">{formatAedWhole(milestone.amountAed)}</Text>
        </Text>
        {canMarkPaid ? (
          <PressableScale
            accessibilityLabel={t("deal.markPaidAccessibility", { label: milestone.label })}
            disabled={isPending}
            haptic
            focusRadius={tokens.radius.pill}
            pressScale={tokens.control.button.pressScale}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  rtl: {
    direction: "rtl",
  },
  scroll: {
    paddingBottom: tokens.layout.appScreenBottomPadding,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
  },
  emptyTitle: {
    marginBottom: tokens.spacing[12],
  },
  emptyBody: {
    marginBottom: tokens.spacing[22],
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: tokens.spacing[12],
  },
  heroBlock: {
    marginBottom: tokens.spacing[16],
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
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[16],
    marginBottom: tokens.spacing[16],
  },
  panelLabel: {
    marginBottom: tokens.spacing[8],
  },
  paidAmount: {
    fontSize: 25,
    lineHeight: 31,
  },
  detailProgressTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.progressTrack,
    marginTop: tokens.spacing[12],
  },
  detailProgressFill: {
    height: "100%",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.accent,
  },
  error: {
    color: tokens.colors.over,
    marginBottom: tokens.spacing[12],
  },
  towerPanel: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: 20,
  },
  towerTitle: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: tokens.spacing[16],
  },
  milestoneRow: {
    position: "relative",
    borderLeftWidth: 2,
    borderLeftColor: tokens.colors.line,
    paddingLeft: 36,
    paddingBottom: tokens.spacing[22],
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
    borderColor: tokens.colors.line,
    borderRadius: 7,
    backgroundColor: tokens.colors.panel2,
  },
  nodeDone: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.accent,
  },
  nodeNow: {
    borderColor: tokens.colors.due,
    shadowColor: tokens.colors.due,
    shadowOpacity: 0.24,
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
    marginBottom: tokens.spacing[4],
  },
  milestoneMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  milestoneStatus: {
    color: tokens.colors.muted,
  },
  statusDone: {
    color: tokens.colors.ink,
  },
  statusDue: {
    color: tokens.colors.due,
  },
  statusOver: {
    color: tokens.colors.over,
  },
  markPaidButton: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.dueTint,
    paddingHorizontal: tokens.spacing[12],
  },
  markPaidText: {
    color: tokens.colors.due,
    fontFamily: tokens.font.monoSemi,
  },
});
