import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { RemindersRepository } from "@/shared/data/repositories/remindersRepository";

export async function registerForReminderPush(remindersRepository: RemindersRepository) {
  if (Platform.OS === "web") {
    throw new Error("Push reminders can be registered from an iOS or Android build.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("milestone-reminders", {
      name: "Milestone reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 240, 180, 240],
      lightColor: "#c8a96a",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const finalStatus = current.granted ? current : await Notifications.requestPermissionsAsync();

  if (!finalStatus.granted) {
    throw new Error("Notification permission was not granted.");
  }

  const projectId = Constants.easConfig?.projectId;
  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  const registration = await remindersRepository.registerPushToken(tokenResponse.data);

  return registration.message;
}
