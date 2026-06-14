import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { DealDeck, getPortfolioMetrics } from "@/features/dashboard";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { finishPerformanceJourney } from "@/shared/observability/sentry";
import { tokens } from "@/shared/theme/tokens";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

function formatPosition(index: number, total: number) {
  if (total === 0) {
    return "00 / 00";
  }

  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useI18nControls();
  const { deals: dealsRepository } = useRepositories();
  const [activeIndex, setActiveIndex] = useState(0);
  const dealsQuery = useQuery({
    queryKey: ["dashboard-deals"],
    queryFn: () => dealsRepository.listDashboardDeals(),
  });

  const deals = dealsQuery.data ?? [];
  const safeActiveIndex = deals.length === 0 ? 0 : Math.min(activeIndex, deals.length - 1);
  const metrics = getPortfolioMetrics(deals);

  useEffect(() => {
    if (dealsQuery.isLoading) {
      return;
    }

    finishPerformanceJourney("open_to_home", {
      deal_count: deals.length,
      outcome: dealsQuery.isError ? "error" : "ready",
    });
  }, [deals.length, dealsQuery.isError, dealsQuery.isLoading]);

  const handleDealPress = useCallback(
    (dealId: string) => {
      router.push({ pathname: "/deal/[dealId]", params: { dealId } });
    },
    [router],
  );

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360 }}>
        <View style={styles.header}>
          <View>
            <Text variant="eyebrow">{t("home.eyebrow")}</Text>
            <Text variant="h1">{t("home.title")}</Text>
          </View>
          <Text variant="mono" muted style={styles.position}>
            {formatPosition(safeActiveIndex, deals.length)}
          </Text>
        </View>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 80 }}>
        <View style={styles.glance}>
          <Text variant="mono" muted>
            <Text variant="mono">{metrics.escrowLabel}</Text> {t("home.inEscrow")}
          </Text>
          <Text variant="mono" muted>
            <Text variant="mono" style={styles.dueText}>
              {metrics.dueLabel}
            </Text>{" "}
            {t("home.due")}
          </Text>
        </View>
      </MotiView>

      {dealsQuery.isError ? (
        <Text variant="caption" style={styles.error}>
          {dealsQuery.error instanceof Error ? dealsQuery.error.message : "Could not load your portfolio."}
        </Text>
      ) : null}

      <DealDeck deals={deals} activeIndex={safeActiveIndex} isLoading={dealsQuery.isLoading} isRTL={isRTL} onActiveIndexChange={setActiveIndex} onDealPress={handleDealPress} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: tokens.layout.appScreenBottomPadding,
  },
  rtl: {
    direction: "rtl",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: tokens.spacing[16],
  },
  position: {
    marginTop: 6,
  },
  glance: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[16],
    marginBottom: tokens.spacing[16],
  },
  dueText: {
    color: tokens.colors.due,
  },
  error: {
    color: tokens.colors.over,
    marginBottom: tokens.spacing[12],
  },
});
