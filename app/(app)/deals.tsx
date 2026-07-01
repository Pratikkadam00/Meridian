import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import type { DashboardDeal } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton } from "@/shared/ui/Button";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

export default function DealsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { deals: dealsRepository } = useRepositories();
  const { isRTL } = useI18nControls();
  const styles = useThemedStyles(makeStyles);
  const dealsQuery = useQuery({
    queryKey: ["dashboard-deals"],
    queryFn: () => dealsRepository.listDashboardDeals(),
  });

  const handleDealPress = useCallback(
    (dealId: string) => {
      router.push({ pathname: "/deal/[dealId]", params: { dealId } });
    },
    [router],
  );

  const renderDeal = useCallback(({ item }: ListRenderItemInfo<DashboardDeal>) => <DealListRow deal={item} onPress={handleDealPress} />, [handleDealPress]);

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <FlashList
        data={dealsQuery.data ?? []}
        renderItem={renderDeal}
        keyExtractor={(deal) => deal.id}
        drawDistance={260}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<DealListHeader error={dealsQuery.error} />}
        ListEmptyComponent={dealsQuery.isLoading ? <ListState label={t("deals.loading")} /> : <ListState label={t("deals.empty")} />}
        ListFooterComponent={
          <Link href="/new-deal" asChild>
            <GoldButton label={t("deals.newDeal")} />
          </Link>
        }
      />
    </Screen>
  );
}

function DealListHeader({ error }: { error: Error | null }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <Text variant="eyebrow">{t("deals.eyebrow")}</Text>
      <Text variant="h1" style={styles.title}>
        {t("deals.title")}
      </Text>
      {error ? (
        <Text variant="caption" style={styles.error}>
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

function DealListRow({ deal, onPress }: { deal: DashboardDeal; onPress: (dealId: string) => void }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale
      accessibilityLabel={t("deals.openDeal", { projectName: deal.projectName })}
      focusRadius={18 + 3}
      pressScale={0.985}
      haptic
      onPress={() => onPress(deal.id)}
      pressableStyle={styles.row}
      outerStyle={styles.rowWrap}
    >
      <View style={styles.rowCopy}>
        <Text variant="cardTitle" style={styles.rowTitle}>
          {deal.projectName}
        </Text>
        <Text variant="caption" muted>
          {deal.developer}
        </Text>
      </View>
      <Text variant="mono" style={deal.status === "due" ? styles.due : styles.status}>
        {deal.dueInLabel}
      </Text>
    </PressableScale>
  );
}

function ListState({ label }: { label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.listState}>
      <Text variant="mono" muted>
        {label}
      </Text>
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
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[5],
    },
    listContent: {
      paddingBottom: t.sizing.tabBarClearance,
    },
    error: {
      color: t.status.overdue.text,
      marginBottom: t.space[3],
    },
    listState: {
      minHeight: 124,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      marginBottom: t.space[3],
    },
    rowWrap: {
      marginBottom: t.space[3],
    },
    row: {
      minHeight: 82,
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
    },
    rowTitle: {
      fontSize: 17,
      lineHeight: 21,
      marginBottom: t.space[1],
    },
    status: {
      color: t.color.textSecondary,
    },
    due: {
      color: t.color.accentText,
    },
  });
