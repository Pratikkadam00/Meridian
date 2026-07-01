import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { formatAedCompact, formatAedWhole } from "@/features/dashboard";
import type { DashboardDeal, PortfolioCommissionTranche } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

import { computeClawbackExposure, computeCommissionSummary, computeIncomeForecast, computePortfolioSummary, type ClawbackBand } from "./reportsFormat";

// Stable empty-array fallbacks — `data ?? []` would create a new reference on
// every render while loading, defeating useMemo below.
const EMPTY_TRANCHES: PortfolioCommissionTranche[] = [];
const EMPTY_DEALS: DashboardDeal[] = [];

export function ReportsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useI18nControls();
  const { deals: dealsRepository } = useRepositories();
  const styles = useThemedStyles(makeStyles);

  const dealsQuery = useQuery({
    queryKey: ["dashboard-deals"],
    queryFn: () => dealsRepository.listDashboardDeals(),
  });
  const tranchesQuery = useQuery({
    queryKey: ["portfolio-commission-tranches"],
    queryFn: () => dealsRepository.listAllCommissionTranches(),
  });

  const tranches = tranchesQuery.data ?? EMPTY_TRANCHES;
  const deals = dealsQuery.data ?? EMPTY_DEALS;

  const portfolio = useMemo(() => computePortfolioSummary(deals), [deals]);
  const commission = useMemo(() => computeCommissionSummary(tranches), [tranches]);
  const forecast = useMemo(() => computeIncomeForecast(tranches), [tranches]);
  // Stamp "now" once per data load, not on every render — keeps clawback-day
  // counts stable while the screen is open.
  const clawback = useMemo(() => computeClawbackExposure(tranches, new Date()), [tranches]);

  const isLoading = dealsQuery.isLoading || tranchesQuery.isLoading;

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="eyebrow">{t("reports.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("reports.title")}
        </Text>
        <Text variant="body" muted style={styles.lede}>
          {t("reports.lede")}
        </Text>

        {isLoading ? (
          <Text variant="mono" muted>
            {t("reports.loading")}
          </Text>
        ) : (
          <>
            <View style={styles.glance}>
              <View style={styles.glanceCell}>
                <Text variant="caption" muted>
                  {t("reports.portfolioValue")}
                </Text>
                <Text variant="cardTitle" style={styles.glanceValue}>
                  {formatAedCompact(portfolio.totalValueAed)}
                </Text>
                <Text variant="caption" muted>
                  {t("reports.portfolioPaid", { percent: portfolio.paidPercent, count: portfolio.dealCount })}
                </Text>
              </View>
            </View>

            <Text variant="cardTitle" style={styles.sectionTitle}>
              {t("reports.commissionTitle")}
            </Text>
            <View style={styles.glance}>
              <View style={styles.glanceCell}>
                <Text variant="caption" muted>
                  {t("reports.commissionCollected")}
                </Text>
                <Text variant="cardTitle" style={styles.glanceValuePaid}>
                  {formatAedCompact(commission.collectedAed)}
                </Text>
              </View>
              <View style={styles.glanceCell}>
                <Text variant="caption" muted>
                  {t("reports.commissionOutstanding")}
                </Text>
                <Text variant="cardTitle" style={styles.glanceValueDue}>
                  {formatAedCompact(commission.outstandingAed)}
                </Text>
              </View>
            </View>

            <Text variant="cardTitle" style={styles.sectionTitle}>
              {t("reports.forecastTitle")}
            </Text>
            {forecast.length ? (
              forecast.map((month) => (
                <View key={month.monthKey} style={styles.row}>
                  <Text variant="body">{month.monthLabel}</Text>
                  <Text variant="mono" muted>
                    {t("reports.forecastCount", { count: month.count })}
                  </Text>
                  <Text variant="mono" style={styles.rowAmount}>
                    {t("currency.aed")} {formatAedWhole(month.totalAed)}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" muted style={styles.emptyText}>
                {t("reports.forecastEmpty")}
              </Text>
            )}

            <Text variant="cardTitle" style={styles.sectionTitle}>
              {t("reports.clawbackTitle")}
            </Text>
            <Text variant="caption" muted style={styles.clawbackLede}>
              {t("reports.clawbackLede")}
            </Text>
            {clawback.length ? (
              clawback.map((item) => (
                <View key={item.trancheId} style={styles.row}>
                  <View style={styles.rowCopy}>
                    <Text variant="body" numberOfLines={1}>
                      {item.projectName}
                    </Text>
                    <Text variant="mono" muted>
                      {t(`reports.clawback${bandLabelKey(item.band)}`, { days: item.daysSinceReceived })}
                    </Text>
                  </View>
                  <Text variant="mono" style={item.band === "high" ? styles.rowAmountHigh : styles.rowAmountModerate}>
                    {t("currency.aed")} {formatAedWhole(item.amountAed)}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" muted style={styles.emptyText}>
                {t("reports.clawbackEmpty")}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function bandLabelKey(band: ClawbackBand) {
  return band === "high" ? "High" : "Moderate";
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
      paddingBottom: t.sizing.tabBarClearance,
    },
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[2],
    },
    lede: {
      marginBottom: t.space[5],
    },
    glance: {
      flexDirection: "row",
      gap: t.space[3],
      marginBottom: t.space[5],
    },
    glanceCell: {
      flex: 1,
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[4],
      ...t.elevation.sm,
    },
    glanceValue: {
      fontSize: 22,
      lineHeight: 27,
      marginTop: t.space[2],
      marginBottom: t.space[1],
    },
    glanceValuePaid: {
      fontSize: 22,
      lineHeight: 27,
      marginTop: t.space[2],
      color: t.status.paid.text,
    },
    glanceValueDue: {
      fontSize: 22,
      lineHeight: 27,
      marginTop: t.space[2],
      color: t.color.accentText,
    },
    sectionTitle: {
      fontSize: 15,
      lineHeight: 20,
      marginBottom: t.space[3],
    },
    clawbackLede: {
      marginBottom: t.space[3],
      marginTop: -t.space[1],
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.md,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[3],
      marginBottom: t.space[2],
    },
    rowCopy: {
      flex: 1,
      gap: 2,
    },
    rowAmount: {
      color: t.color.textPrimary,
    },
    rowAmountHigh: {
      color: t.status.overdue.text,
    },
    rowAmountModerate: {
      color: t.status.due.text,
    },
    emptyText: {
      marginBottom: t.space[5],
    },
  });
