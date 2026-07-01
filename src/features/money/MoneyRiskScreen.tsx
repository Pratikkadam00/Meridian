import { useQuery } from "@tanstack/react-query";
import { Decimal } from "decimal.js";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { formatAedCompact, formatAedWhole } from "@/features/dashboard";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

export function MoneyRiskScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useI18nControls();
  const { deals: dealsRepository } = useRepositories();
  const styles = useThemedStyles(makeStyles);

  const dealsQuery = useQuery({
    queryKey: ["dashboard-deals"],
    queryFn: () => dealsRepository.listDashboardDeals(),
  });
  const commissionQuery = useQuery({
    queryKey: ["commission-risk"],
    queryFn: () => dealsRepository.listCommissionRisk(),
  });

  const atRiskDeals = (dealsQuery.data ?? []).filter((deal) => deal.status === "due" || deal.status === "over");
  const commissionRisk = commissionQuery.data ?? [];

  const dueTotal = atRiskDeals.reduce((sum, deal) => sum.plus(deal.dueAmountAed || "0"), new Decimal(0));
  const commissionTotal = commissionRisk.reduce((sum, item) => sum.plus(item.amountAed || "0"), new Decimal(0));

  function openDeal(dealId: string) {
    router.push({ pathname: "/deal/[dealId]", params: { dealId } });
  }

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="eyebrow">{t("money.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("money.title")}
        </Text>
        <Text variant="body" muted style={styles.lede}>
          {t("money.lede")}
        </Text>

        <View style={styles.glance}>
          <View style={styles.glanceCell}>
            <Text variant="caption" muted>
              {t("money.dueThisWeek")}
            </Text>
            <Text variant="cardTitle" style={styles.glanceValue}>
              {formatAedCompact(dueTotal.toDecimalPlaces(0).toFixed(0))}
            </Text>
          </View>
          <View style={styles.glanceCell}>
            <Text variant="caption" muted>
              {t("money.commissionOutstanding")}
            </Text>
            <Text variant="cardTitle" style={[styles.glanceValue, commissionTotal.greaterThan(0) && styles.glanceAccent]}>
              {formatAedCompact(commissionTotal.toDecimalPlaces(0).toFixed(0))}
            </Text>
          </View>
        </View>

        <Text variant="cardTitle" style={styles.sectionTitle}>
          {t("money.instalmentsTitle")}
        </Text>
        {atRiskDeals.length ? (
          atRiskDeals.map((deal) => (
            <PressableScale
              key={deal.id}
              accessibilityLabel={deal.projectName}
              focusRadius={18}
              pressScale={0.985}
              haptic
              onPress={() => openDeal(deal.id)}
              outerStyle={styles.rowWrap}
              pressableStyle={styles.row}
            >
              <View style={styles.rowCopy}>
                <Text variant="cardTitle" style={styles.rowTitle} numberOfLines={1}>
                  {deal.projectName}
                </Text>
                <Text variant="mono" muted numberOfLines={1}>
                  {deal.dueInLabel}
                </Text>
              </View>
              <Text variant="mono" style={deal.status === "over" ? styles.amountOver : styles.amountDue}>
                {t("currency.aed")} {formatAedWhole(deal.dueAmountAed)}
              </Text>
            </PressableScale>
          ))
        ) : (
          <Text variant="body" muted style={styles.emptyText}>
            {t("money.instalmentsEmpty")}
          </Text>
        )}

        <Text variant="cardTitle" style={styles.sectionTitle}>
          {t("money.commissionTitle")}
        </Text>
        {commissionRisk.length ? (
          commissionRisk.map((item) => (
            <PressableScale
              key={item.trancheId}
              accessibilityLabel={item.projectName}
              focusRadius={18}
              pressScale={0.985}
              haptic
              onPress={() => openDeal(item.dealId)}
              outerStyle={styles.rowWrap}
              pressableStyle={styles.row}
            >
              <View style={styles.rowCopy}>
                <Text variant="cardTitle" style={styles.rowTitle} numberOfLines={1}>
                  {item.projectName}
                </Text>
                <Text variant="mono" muted numberOfLines={1}>
                  {item.expectedDateLabel ? t("money.commissionRowMeta", { label: item.label, date: item.expectedDateLabel }) : item.label}
                </Text>
              </View>
              <Text variant="mono" style={styles.amountCommission}>
                {t("currency.aed")} {formatAedWhole(item.amountAed)}
              </Text>
            </PressableScale>
          ))
        ) : (
          <Text variant="body" muted style={styles.emptyText}>
            {t("money.commissionEmpty")}
          </Text>
        )}
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
      marginBottom: t.space[6],
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
    },
    glanceAccent: {
      color: t.color.accentText,
    },
    sectionTitle: {
      fontSize: 15,
      lineHeight: 20,
      marginBottom: t.space[3],
      marginTop: t.space[2],
    },
    rowWrap: {
      marginBottom: t.space[3],
    },
    row: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: t.space[3],
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[4],
      ...t.elevation.sm,
    },
    rowCopy: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontSize: 16,
      lineHeight: 20,
    },
    amountDue: {
      color: t.status.due.text,
    },
    amountOver: {
      color: t.status.overdue.text,
    },
    amountCommission: {
      color: t.color.accentText,
    },
    emptyText: {
      marginBottom: t.space[6],
    },
  });
