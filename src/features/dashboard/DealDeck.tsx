/* eslint-disable react-hooks/immutability */
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import type { DashboardDeal } from "@/shared/data/repositories/dealsRepository";
import { tokens } from "@/shared/theme/tokens";
import { GoldButton } from "@/shared/ui/Button";
import { Text } from "@/shared/ui/Text";

import { formatAedCompact } from "./dashboardFormat";

type DealDeckProps = {
  deals: DashboardDeal[];
  activeIndex: number;
  isLoading: boolean;
  isRTL: boolean;
  onActiveIndexChange: (index: number) => void;
  onDealPress: (dealId: string) => void;
};

const SWIPE_ADVANCE_THRESHOLD = 90;

export function DealDeck({ deals, activeIndex, isLoading, isRTL, onActiveIndexChange, onDealPress }: DealDeckProps) {
  const { t } = useTranslation();
  const translateX = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const activeDeal = deals[activeIndex];
  const nextDeal = deals[(activeIndex + 1) % Math.max(deals.length, 1)];
  const thirdDeal = deals[(activeIndex + 2) % Math.max(deals.length, 1)];
  const activeDealId = activeDeal?.id;

  const advanceDeck = useCallback(() => {
    if (deals.length <= 1) {
      return;
    }

    onActiveIndexChange((activeIndex + 1) % deals.length);
  }, [activeIndex, deals.length, onActiveIndexChange]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .onUpdate((event) => {
          translateX.value = event.translationX;
        })
        .onEnd((event) => {
          const shouldAdvance = Math.abs(event.translationX) > SWIPE_ADVANCE_THRESHOLD || Math.abs(event.velocityX) > 850;

          if (shouldAdvance) {
            runOnJS(advanceDeck)();
          }

          translateX.value = reducedMotion ? withTiming(0, { duration: 120 }) : withSpring(0, tokens.motion.spring);
        }),
    [advanceDeck, reducedMotion, translateX],
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .onEnd((_event, success) => {
          if (success && activeDealId) {
            runOnJS(onDealPress)(activeDealId);
          }
        }),
    [activeDealId, onDealPress],
  );

  const gesture = useMemo(() => Gesture.Simultaneous(panGesture, tapGesture), [panGesture, tapGesture]);

  const frontCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${translateX.value / 36}deg` },
      { scale: 1 - Math.min(Math.abs(translateX.value) / 1500, 0.035) },
    ],
  }));

  if (isLoading) {
    return (
      <View style={styles.deckSlot}>
        <View style={styles.loadingCard}>
          <Text variant="mono" muted>
            {t("home.loadingPortfolio")}
          </Text>
        </View>
      </View>
    );
  }

  if (!activeDeal) {
    return (
      <View style={styles.deckSlot}>
        <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360 }} style={styles.emptyCard}>
          <Text variant="eyebrow">{t("home.firstDealEyebrow")}</Text>
          <Text variant="h1" style={styles.emptyTitle}>
            {t("home.addFirstDeal")}
          </Text>
          <Text variant="body" muted style={styles.emptyBody}>
            {t("home.firstDealBody")}
          </Text>
          <Link href="/new-deal" asChild>
            <GoldButton label={t("home.addFirstDeal")} />
          </Link>
        </MotiView>
      </View>
    );
  }

  return (
    <>
      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 160 }} style={styles.deckSlot}>
        {thirdDeal && deals.length > 2 ? <DeckShadowCard offset="far" /> : null}
        {nextDeal && deals.length > 1 ? <DeckShadowCard offset="near" /> : null}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.frontCardShell, frontCardStyle]}>
            <DealCard deal={activeDeal} isRTL={isRTL} />
          </Animated.View>
        </GestureDetector>
      </MotiView>
      <DeckDots count={deals.length} activeIndex={activeIndex} />
    </>
  );
}

function DeckShadowCard({ offset }: { offset: "near" | "far" }) {
  return <View pointerEvents="none" style={[styles.shadowCard, offset === "near" ? styles.shadowCardNear : styles.shadowCardFar]} />;
}

function DealCard({ deal, isRTL }: { deal: DashboardDeal; isRTL: boolean }) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[tokens.colors.deck, tokens.colors.deckEnd]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, deal.status === "due" && styles.cardDue, deal.status === "over" && styles.cardOver, isRTL && styles.rtl]}
    >
      <Text variant="eyebrow">
        {deal.developer} - {deal.locationLabel}
      </Text>
      <Text variant="cardTitle" style={styles.project}>
        {deal.projectName}
      </Text>
      <Text variant="body" muted>
        {deal.buyerName}
      </Text>
      <View style={styles.cardSpacer} />
      <Text variant="caption" muted>
        {t("home.next")} - <Text variant="caption">{deal.nextMilestoneLabel}</Text> - {deal.nextMilestoneDate}
      </Text>
      <Text variant="amount">{formatAedCompact(deal.totalValueAed)}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(deal.paidPercent, 100))}%` }]} />
      </View>
      <View style={styles.cardFooter}>
        <Text variant="mono" muted>
          {deal.paidPercent}% {t("home.paid")}
        </Text>
        <View style={[styles.chip, deal.status === "ok" && styles.chipOk, deal.status === "over" && styles.chipOver]}>
          <View style={[styles.chipDot, deal.status === "ok" && styles.chipDotOk, deal.status === "over" && styles.chipDotOver]} />
          <Text variant="caption" style={[styles.chipText, deal.status === "ok" && styles.chipTextOk, deal.status === "over" && styles.chipTextOver]}>
            {deal.dueInLabel}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function DeckDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  if (count <= 1) {
    return <View style={styles.dotsSpacer} />;
  }

  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  deckSlot: {
    minHeight: 430,
    justifyContent: "center",
    marginBottom: tokens.spacing[16],
  },
  frontCardShell: {
    minHeight: 410,
  },
  shadowCard: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 26,
    bottom: 10,
    borderRadius: tokens.radius.deck,
    backgroundColor: tokens.colors.panel,
    opacity: 0.7,
  },
  shadowCardNear: {
    transform: [{ scale: 0.94 }, { translateY: 2 }],
  },
  shadowCardFar: {
    left: 34,
    right: 34,
    top: 44,
    bottom: -2,
    transform: [{ scale: 0.88 }, { translateY: 8 }],
    opacity: 0.34,
  },
  card: {
    minHeight: 410,
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.deck,
    padding: 26,
    shadowColor: tokens.colors.black,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
    elevation: 12,
  },
  cardDue: {
    borderColor: tokens.colors.goldHairline,
    shadowColor: tokens.colors.accent,
    shadowOpacity: 0.2,
  },
  cardOver: {
    borderColor: tokens.colors.over,
  },
  rtl: {
    direction: "rtl",
  },
  project: {
    marginTop: 7,
    marginBottom: tokens.spacing[4],
  },
  cardSpacer: {
    flex: 1,
    minHeight: 116,
  },
  progressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.progressTrack,
    marginTop: tokens.spacing[16],
  },
  progressFill: {
    height: "100%",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.accent,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[16],
  },
  chip: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.dueTint,
    paddingHorizontal: tokens.spacing[12],
    paddingVertical: tokens.spacing[4],
  },
  chipOk: {
    backgroundColor: tokens.colors.okTint,
  },
  chipOver: {
    backgroundColor: tokens.colors.overTint,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.due,
  },
  chipDotOk: {
    backgroundColor: tokens.colors.ok,
  },
  chipDotOver: {
    backgroundColor: tokens.colors.over,
  },
  chipText: {
    color: tokens.colors.due,
  },
  chipTextOk: {
    color: tokens.colors.ok,
  },
  chipTextOver: {
    color: tokens.colors.over,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: tokens.spacing[4],
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.progressTrack,
  },
  dotActive: {
    width: 22,
    backgroundColor: tokens.colors.accent,
  },
  dotsSpacer: {
    height: 18,
  },
  loadingCard: {
    minHeight: 410,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.deck,
    backgroundColor: tokens.colors.deck,
  },
  emptyCard: {
    minHeight: 410,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.goldHairline,
    borderRadius: tokens.radius.deck,
    backgroundColor: tokens.colors.deck,
    padding: tokens.spacing[22],
  },
  emptyTitle: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[12],
  },
  emptyBody: {
    marginBottom: tokens.spacing[22],
  },
});
