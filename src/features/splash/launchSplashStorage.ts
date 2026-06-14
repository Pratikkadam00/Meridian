import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const LAUNCH_SPLASH_KEY = "meridian.launchSplash.seen.v1";

function getWebStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function hasSeenLaunchSplash() {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(LAUNCH_SPLASH_KEY) === "1";
  }

  try {
    return (await SecureStore.getItemAsync(LAUNCH_SPLASH_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setLaunchSplashSeen() {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(LAUNCH_SPLASH_KEY, "1");
    return;
  }

  try {
    await SecureStore.setItemAsync(LAUNCH_SPLASH_KEY, "1");
  } catch {
    // A storage failure should not trap users behind the launch animation.
  }
}
