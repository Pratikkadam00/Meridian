/* eslint-disable react-hooks/immutability */
import { Link } from "expo-router";
import { MotiView } from "moti";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import type { DashboardDeal } from "@/shared/data/repositories/dealsRepository";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
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
  const styles = useThemedStyles(makeStyles);
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

          translateX.value = reducedMotion ? withTiming(0, { duration: 120 }) : withSpring(0, { damping: 18, stiffness: 140 });
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
          <Animated.View
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${activeDeal.projectName}, ${activeDeal.developer}, ${activeDeal.dueInLabel}`}
            accessibilityActions={deals.length > 1 ? [{ name: "increment", label: t("home.nextDeal") }] : undefined}
            onAccessibilityTap={() => {
              if (activeDealId) {
                onDealPress(activeDealId);
              }
            }}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === "increment") {
                advanceDeck();
              }
            }}
            style={[styles.frontCardShell, frontCardStyle]}
          >
            <DealCard deal={activeDeal} isRTL={isRTL} />
          </Animated.View>
        </GestureDetector>
      </MotiView>
      <DeckDots count={deals.length} activeIndex={activeIndex} />
    </>
  );
}

function DeckShadowCard({ offset }: { offset: "near" | "far" }) {
  const styles = useThemedStyles(makeStyles);
  return <View pointerEvents="none" style={[styles.shadowCard, offset === "near" ? styles.shadowCardNear : styles.shadowCardFar]} />;
}

function DealCard({ deal, isRTL }: { deal: DashboardDeal; isRTL: boolean }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.card, deal.status === "due" && styles.cardDue, deal.status === "over" && styles.cardOver, isRTL && styles.rtl]}>
      <Text variant="eyebrow" numberOfLines={1}>
        {deal.developer} - {deal.locationLabel}
      </Text>
      <Text variant="cardTitle" style={styles.project} numberOfLines={1}>
        {deal.projectName}
      </Text>
      <Text variant="body" muted numberOfLines={1}>
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
    </View>
  );
}

function DeckDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    deckSlot: {
      minHeight: 430,
      justifyContent: "center",
      marginBottom: t.space[4],
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
      borderRadius: t.radius.xl,
      borderWidth: 1,
      borderColor: t.color.borderHair,
      backgroundColor: t.color.surfaceCard,
      opacity: 0.6,
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
      borderColor: t.color.borderHair,
      borderRadius: t.radius.xl,
      backgroundColor: t.color.surfaceCard,
      padding: 26,
      ...t.elevation.md,
    },
    cardDue: {
      borderColor: t.color.accent,
    },
    cardOver: {
      borderColor: t.status.overdue.solid,
    },
    rtl: {
      direction: "rtl",
    },
    project: {
      marginTop: 7,
      marginBottom: t.space[1],
    },
    cardSpacer: {
      flex: 1,
      minHeight: 116,
    },
    progressTrack: {
      height: 6,
      overflow: "hidden",
      borderRadius: t.radius.pill,
      backgroundColor: t.color.surfaceSunk,
      marginTop: t.space[4],
    },
    progressFill: {
      height: "100%",
      borderRadius: t.radius.pill,
      backgroundColor: t.color.action,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
      marginTop: t.space[4],
    },
    chip: {
      minHeight: 28,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: t.radius.pill,
      backgroundColor: t.status.due.bg,
      paddingHorizontal: t.space[3],
      paddingVertical: t.space[1],
    },
    chipOk: {
      backgroundColor: t.status.paid.bg,
    },
    chipOver: {
      backgroundColor: t.status.overdue.bg,
    },
    chipDot: {
      width: 5,
      height: 5,
      borderRadius: t.radius.pill,
      backgroundColor: t.status.due.solid,
    },
    chipDotOk: {
      backgroundColor: t.status.paid.solid,
    },
    chipDotOver: {
      backgroundColor: t.status.overdue.solid,
    },
    chipText: {
      color: t.status.due.text,
    },
    chipTextOk: {
      color: t.status.paid.text,
    },
    chipTextOver: {
      color: t.status.overdue.text,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginBottom: t.space[1],
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: t.radius.pill,
      backgroundColor: t.color.borderStrong,
    },
    dotActive: {
      width: 22,
      backgroundColor: t.color.action,
    },
    dotsSpacer: {
      height: 18,
    },
    loadingCard: {
      minHeight: 410,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.xl,
      backgroundColor: t.color.surfaceCard,
    },
    emptyCard: {
      minHeight: 410,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.color.action,
      borderRadius: t.radius.xl,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[5],
    },
    emptyTitle: {
      marginTop: t.space[2],
      marginBottom: t.space[3],
    },
    emptyBody: {
      marginBottom: t.space[5],
    },
  });
