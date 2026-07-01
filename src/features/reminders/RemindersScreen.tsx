import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { TFunction } from "i18next";
import { BellRing, MessageCircle, RefreshCw } from "lucide-react-native";
import { MotiView } from "moti";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet, View } from "react-native";

import type { ReminderItem, ReminderUrgency } from "@/shared/data/repositories/remindersRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useFeatureFlag } from "@/shared/featureFlags/FeatureFlagProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { Button, GoldButton, GhostButton } from "@/shared/ui/Button";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

import { registerForReminderPush } from "./notificationRegistration";

const remindersQueryKey = ["reminders"] as const;

type UrgencyColors = { nodeBorder: string; nodeBg: string; text: string };

function urgencyColors(t: MeridianTheme, urgency: ReminderUrgency): UrgencyColors {
  switch (urgency) {
    case "ready":
      return { nodeBorder: t.status.due.solid, nodeBg: t.status.due.solid, text: t.status.due.text };
    case "overdue":
      return { nodeBorder: t.status.overdue.solid, nodeBg: t.status.overdue.solid, text: t.status.overdue.text };
    case "failed":
      return { nodeBorder: t.status.overdue.solid, nodeBg: t.color.surfaceSunk, text: t.status.overdue.text };
    case "sent":
      return { nodeBorder: t.status.paid.solid, nodeBg: t.status.paid.solid, text: t.status.paid.text };
    default:
      return { nodeBorder: t.color.action, nodeBg: t.color.surfaceSunk, text: t.color.actionText };
  }
}

export function RemindersScreen() {
  const { t } = useTranslation();
  const { reminders: remindersRepository } = useRepositories();
  const pushRemindersEnabled = useFeatureFlag("push_reminders");
  const whatsappRemindersEnabled = useFeatureFlag("whatsapp_reminders");
  const styles = useThemedStyles(makeStyles);
  const [message, setMessage] = useState<string | null>(null);

  const remindersQuery = useQuery({
    queryKey: remindersQueryKey,
    queryFn: () => remindersRepository.listUpcomingReminders(),
  });

  // Whether the reminder dispatcher is actually running — a real trust signal
  // for the app's core promise, not just "we scheduled a row and hoped".
  const dispatchHealthQuery = useQuery({
    queryKey: ["reminder-dispatch-health"],
    queryFn: () => remindersRepository.getDispatchHealth(),
    staleTime: 5 * 60_000,
  });

  const registerPushMutation = useMutation({
    mutationFn: () => registerForReminderPush(remindersRepository),
    onSuccess: (successMessage) => {
      setMessage(successMessage);
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : t("reminders.pushRegisterError"));
    },
  });

  const shareReminder = useCallback(async (reminder: ReminderItem) => {
    setMessage(null);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      await Linking.openURL(reminder.whatsappUrl);
    } catch {
      setMessage(t("reminders.whatsappOpenError"));
    }
  }, [t]);

  const reminders = remindersQuery.data ?? [];
  const readyCount = reminders.filter((reminder) => reminder.urgency === "ready" || reminder.urgency === "overdue").length;
  const failedCount = reminders.filter((reminder) => reminder.status === "failed").length;

  const renderReminder = useCallback(
    ({ item, index }: ListRenderItemInfo<ReminderItem>) => (
      <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 320, delay: 120 + index * 55 }}
        style={styles.reminderItem}
      >
        <ReminderRow reminder={item} whatsappEnabled={whatsappRemindersEnabled} onShare={shareReminder} />
      </MotiView>
    ),
    [shareReminder, styles.reminderItem, whatsappRemindersEnabled],
  );

  return (
    <Screen contentStyle={styles.screen}>
      <FlashList
        data={remindersQuery.isLoading || remindersQuery.isError ? [] : reminders}
        renderItem={renderReminder}
        keyExtractor={(reminder) => reminder.id}
        drawDistance={360}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ReminderListHeader
            readyCount={readyCount}
            failedCount={failedCount}
            pushRemindersEnabled={pushRemindersEnabled}
            isRegistering={registerPushMutation.isPending}
            isFetching={remindersQuery.isFetching}
            message={message}
            dispatchStale={dispatchHealthQuery.data?.isStale ?? false}
            onRegisterPush={() => registerPushMutation.mutate()}
            onRefresh={() => void remindersQuery.refetch()}
          />
        }
        ListEmptyComponent={
          <ReminderListEmpty
            isLoading={remindersQuery.isLoading}
            error={remindersQuery.error}
            onRefresh={() => void remindersQuery.refetch()}
          />
        }
      />
    </Screen>
  );
}

type ReminderListHeaderProps = {
  readyCount: number;
  failedCount: number;
  pushRemindersEnabled: boolean;
  isRegistering: boolean;
  isFetching: boolean;
  message: string | null;
  dispatchStale: boolean;
  onRegisterPush: () => void;
  onRefresh: () => void;
};

function ReminderListHeader({ readyCount, failedCount, pushRemindersEnabled, isRegistering, isFetching, message, dispatchStale, onRegisterPush, onRefresh }: ReminderListHeaderProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  return (
    <View>
      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360 }}>
        <Text variant="eyebrow">{t("reminders.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("reminders.title")}
        </Text>
        <Text variant="body" muted style={styles.lede}>
          {t("reminders.lede")}
        </Text>
      </MotiView>

      {dispatchStale ? (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "timing", duration: 240 }} style={styles.staleBanner}>
          <Text variant="caption" style={styles.staleBannerText}>
            {t("reminders.dispatchStale")}
          </Text>
        </MotiView>
      ) : null}

      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 360, delay: 80 }}>
        <View style={styles.summaryPanel}>
          <View>
            <Text variant="caption" muted>
              {t("reminders.readyNow")}
            </Text>
            <Text variant="cardTitle" style={styles.summaryValue}>
              {readyCount}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text variant="caption" muted>
              {t("reminders.failed")}
            </Text>
            <Text variant="cardTitle" style={[styles.summaryValue, failedCount > 0 && styles.failedText]}>
              {failedCount}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {pushRemindersEnabled ? <GoldButton label={isRegistering ? t("reminders.connectingPush") : t("reminders.enablePushReminders")} disabled={isRegistering} onPress={onRegisterPush} /> : null}
          <GhostButton label={isFetching ? t("reminders.refreshing") : t("reminders.refreshSchedule")} onPress={onRefresh} />
        </View>

        {message ? (
          <Text variant="caption" style={styles.message}>
            {message}
          </Text>
        ) : null}
      </MotiView>
    </View>
  );
}

function ReminderListEmpty({ isLoading, error, onRefresh }: { isLoading: boolean; error: Error | null; onRefresh: () => void }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <RefreshCw size={18} color={theme.color.action} strokeWidth={2.1} />
        <Text variant="mono" muted>
          {t("reminders.loadingQueue")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Text variant="cardTitle" style={styles.emptyTitle}>
          {t("reminders.queueUnavailableTitle")}
        </Text>
        <Text variant="body" muted style={styles.emptyBody}>
          {error.message}
        </Text>
        <GhostButton label={t("reminders.tryAgain")} onPress={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <BellRing size={22} color={theme.color.action} strokeWidth={2.1} />
      <Text variant="cardTitle" style={styles.emptyTitle}>
        {t("reminders.emptyTitle")}
      </Text>
      <Text variant="body" muted style={styles.emptyBody}>
        {t("reminders.emptyBody")}
      </Text>
    </View>
  );
}

function ReminderRow({ reminder, whatsappEnabled, onShare }: { reminder: ReminderItem; whatsappEnabled: boolean; onShare: (reminder: ReminderItem) => void }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const colors = urgencyColors(theme, reminder.urgency);

  return (
    <View style={styles.row}>
      <View style={[styles.node, { borderColor: colors.nodeBorder, backgroundColor: colors.nodeBg }]} />
      <View style={styles.copy}>
        <View style={styles.rowTop}>
          <Text variant="cardTitle" style={styles.rowTitle} numberOfLines={1}>
            {reminder.milestoneLabel}
          </Text>
          <Text variant="mono" style={[styles.status, { color: colors.text }]}>
            {statusLabel(reminder, t)}
          </Text>
        </View>
        <Text variant="caption" muted style={styles.dealLabel} numberOfLines={1}>
          {reminder.dealLabel}
        </Text>
        <View style={styles.metaRow}>
          <Text variant="mono" muted>
            {t("reminders.amountPrefix")} <Text variant="mono">{reminder.amountLabel}</Text>
          </Text>
          <Text variant="mono" muted>
            {t("reminders.duePrefix")} <Text variant="mono">{reminder.dueDateLabel}</Text>
          </Text>
          <Text variant="mono" muted>
            {channelLabel(reminder, t)}
          </Text>
        </View>
        {whatsappEnabled ? (
          <Button
            variant="gold"
            size="sm"
            label={t("reminders.shareToWhatsapp")}
            accessibilityLabel={t("reminders.shareToWhatsappA11y", { milestone: reminder.milestoneLabel })}
            onPress={() => onShare(reminder)}
            leftIcon={<MessageCircle size={15} color={theme.color.textOnBrand} strokeWidth={2.4} />}
            style={styles.whatsappButton}
          />
        ) : null}
      </View>
    </View>
  );
}

function channelLabel(reminder: ReminderItem, t: TFunction) {
  return reminder.channels.map((channel) => (channel === "push" ? t("reminders.channelPush") : t("reminders.channelEmail"))).join(" + ");
}

function statusLabel(reminder: ReminderItem, t: TFunction) {
  if (reminder.status === "failed") {
    return t("reminders.statusFailed");
  }

  if (reminder.urgency === "overdue") {
    return t("reminders.statusOverdue");
  }

  if (reminder.urgency === "ready") {
    return t("reminders.statusReadyNow");
  }

  return reminder.sendAtLabel;
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    screen: {
      paddingBottom: 0,
    },
    listContent: {
      paddingBottom: t.sizing.tabBarClearance,
    },
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[2],
    },
    lede: {
      marginBottom: t.space[4],
    },
    staleBanner: {
      borderWidth: 1,
      borderColor: t.status.overdue.solid,
      borderRadius: t.radius.md,
      backgroundColor: t.status.overdue.bg,
      padding: t.space[3],
      marginBottom: t.space[3],
    },
    staleBannerText: {
      color: t.status.overdue.text,
    },
    summaryPanel: {
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[4],
      marginBottom: t.space[3],
      ...t.elevation.sm,
    },
    summaryValue: {
      fontSize: 28,
      lineHeight: 32,
      marginTop: t.space[1],
    },
    summaryDivider: {
      width: 1,
      height: 42,
      backgroundColor: t.color.borderHair,
      marginHorizontal: t.space[5],
    },
    actions: {
      gap: t.space[2],
      marginBottom: t.space[3],
    },
    message: {
      color: t.color.accentText,
      marginBottom: t.space[3],
    },
    reminderItem: {
      marginBottom: t.space[3],
    },
    row: {
      minHeight: 154,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: t.space[3],
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[4],
      ...t.elevation.sm,
    },
    node: {
      width: 13,
      height: 13,
      borderRadius: 5,
      borderWidth: 2,
      marginTop: 4,
    },
    copy: {
      flex: 1,
    },
    rowTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: t.space[3],
    },
    rowTitle: {
      flex: 1,
      fontSize: 17,
      lineHeight: 21,
    },
    status: {
      fontFamily: t.typography.family.monoSemi,
      textAlign: "right",
    },
    dealLabel: {
      marginTop: t.space[1],
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: t.space[3],
      marginTop: t.space[3],
    },
    whatsappButton: {
      alignSelf: "flex-start",
      marginTop: t.space[4],
    },
    centerState: {
      minHeight: 160,
      alignItems: "center",
      justifyContent: "center",
      gap: t.space[2],
    },
    emptyState: {
      minHeight: 210,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[5],
      marginTop: t.space[2],
    },
    emptyTitle: {
      fontSize: 22,
      lineHeight: 27,
      textAlign: "center",
      marginTop: t.space[3],
    },
    emptyBody: {
      textAlign: "center",
      marginTop: t.space[2],
      marginBottom: t.space[4],
    },
    failedText: {
      color: t.status.overdue.text,
    },
  });
