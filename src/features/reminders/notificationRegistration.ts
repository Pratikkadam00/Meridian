import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { t } from "i18next";
import { Platform } from "react-native";

import type { RemindersRepository } from "@/shared/data/repositories/remindersRepository";
import { amber } from "@/shared/theme/meridian";

export async function registerForReminderPush(remindersRepository: RemindersRepository) {
  if (Platform.OS === "web") {
    throw new Error("Push reminders can be registered from an iOS or Android build.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("milestone-reminders", {
      name: t("reminders.channelName"),
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 240, 180, 240],
      lightColor: amber[500], // Meridian Amber accent (single source of truth)
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const finalStatus = current.granted ? current : await Notifications.requestPermissionsAsync();

  if (!finalStatus.granted) {
    throw new Error("Notification permission was not granted.");
  }

  // EAS embeds the project id in expoConfig.extra.eas.projectId (and easConfig
  // on a build). getExpoPushTokenAsync cannot mint a token without it, so fail
  // with an actionable message instead of a cryptic native error.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

  if (!projectId) {
    throw new Error("Push isn't configured yet. Run `eas init` to set the EAS project id, then rebuild.");
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  const registration = await remindersRepository.registerPushToken(tokenResponse.data);

  return registration.message;
}
