import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { TFunction } from "i18next";
import { BellRing, MessageCircle, RefreshCw } from "lucide-react-native";
import { MotiView } from "moti";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet, View, type TextStyle, type ViewStyle } from "react-native";

import type { ReminderItem, ReminderUrgency } from "@/shared/data/repositories/remindersRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useFeatureFlag } from "@/shared/featureFlags/FeatureFlagProvider";
import { tokens } from "@/shared/theme/tokens";
import { Button, GoldButton, GhostButton } from "@/shared/ui/Button";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

import { registerForReminderPush } from "./notificationRegistration";

const remindersQueryKey = ["reminders"] as const;

export function RemindersScreen() {
  const { t } = useTranslation();
  const { reminders: remindersRepository } = useRepositories();
  const pushRemindersEnabled = useFeatureFlag("push_reminders");
  const whatsappRemindersEnabled = useFeatureFlag("whatsapp_reminders");
  const [message, setMessage] = useState<string | null>(null);

  const remindersQuery = useQuery({
    queryKey: remindersQueryKey,
    queryFn: () => remindersRepository.listUpcomingReminders(),
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
    [shareReminder, whatsappRemindersEnabled],
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
  onRegisterPush: () => void;
  onRefresh: () => void;
};

function ReminderListHeader({ readyCount, failedCount, pushRemindersEnabled, isRegistering, isFetching, message, onRegisterPush, onRefresh }: ReminderListHeaderProps) {
  const { t } = useTranslation();
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
          {pushRemindersEnabled ? <GoldButton label={isRegistering ? t("reminders.connectingPush") : t("reminders.enablePushReminders")} disabled={isRegistering} onPress={onRegisterPush} style={isRegistering && styles.disabled} /> : null}
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
  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <RefreshCw size={18} color={tokens.colors.accent} strokeWidth={2.1} />
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
      <BellRing size={22} color={tokens.colors.accent} strokeWidth={2.1} />
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
  const urgencyStyle = urgencyStyles[reminder.urgency];

  return (
    <View style={styles.row}>
      <View style={[styles.node, urgencyStyle.node]} />
      <View style={styles.copy}>
        <View style={styles.rowTop}>
          <Text variant="cardTitle" style={styles.rowTitle}>
            {reminder.milestoneLabel}
          </Text>
          <Text variant="mono" style={[styles.status, urgencyStyle.text]}>
            {statusLabel(reminder, t)}
          </Text>
        </View>
        <Text variant="caption" muted style={styles.dealLabel}>
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
            leftIcon={<MessageCircle size={15} color={tokens.colors.goldInk} strokeWidth={2.4} />}
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

const urgencyStyles: Record<ReminderUrgency, { node: ViewStyle; text: TextStyle }> = {
  ready: {
    node: {
      borderColor: tokens.colors.due,
      backgroundColor: tokens.colors.due,
    },
    text: {
      color: tokens.colors.due,
    },
  },
  scheduled: {
    node: {
      borderColor: tokens.colors.accent,
      backgroundColor: tokens.colors.panel2,
    },
    text: {
      color: tokens.colors.accent,
    },
  },
  overdue: {
    node: {
      borderColor: tokens.colors.over,
      backgroundColor: tokens.colors.over,
    },
    text: {
      color: tokens.colors.over,
    },
  },
  failed: {
    node: {
      borderColor: tokens.colors.over,
      backgroundColor: tokens.colors.panel2,
    },
    text: {
      color: tokens.colors.over,
    },
  },
  sent: {
    node: {
      borderColor: tokens.colors.ok,
      backgroundColor: tokens.colors.ok,
    },
    text: {
      color: tokens.colors.ok,
    },
  },
};

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0,
  },
  listContent: {
    paddingBottom: tokens.layout.appScreenBottomPadding,
  },
  title: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[8],
  },
  lede: {
    marginBottom: tokens.spacing[16],
  },
  summaryPanel: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[16],
    marginBottom: tokens.spacing[12],
  },
  summaryValue: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: tokens.spacing[4],
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: tokens.colors.line,
    marginHorizontal: tokens.spacing[22],
  },
  actions: {
    gap: tokens.spacing[8],
    marginBottom: tokens.spacing[12],
  },
  message: {
    color: tokens.colors.due,
    marginBottom: tokens.spacing[12],
  },
  reminderItem: {
    marginBottom: tokens.spacing[12],
  },
  row: {
    minHeight: 154,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing[12],
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[16],
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
    gap: tokens.spacing[12],
  },
  rowTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 21,
  },
  status: {
    fontFamily: tokens.font.monoSemi,
    textAlign: "right",
  },
  dealLabel: {
    marginTop: tokens.spacing[4],
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[12],
  },
  whatsappButton: {
    alignSelf: "flex-start",
    marginTop: tokens.spacing[16],
  },
  centerState: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[8],
  },
  emptyState: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[22],
    marginTop: tokens.spacing[8],
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 27,
    textAlign: "center",
    marginTop: tokens.spacing[12],
  },
  emptyBody: {
    textAlign: "center",
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[16],
  },
  failedText: {
    color: tokens.colors.over,
  },
  disabled: {
    opacity: 0.56,
  },
});
