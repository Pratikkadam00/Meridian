import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Single source of truth for the biometric app-lock flag, shared by onboarding,
// settings, and the launch gate that enforces it.
export const BIOMETRIC_LOCK_KEY = "meridian.biometricLock.enabled.v1";

export async function isBiometricLockEnabled(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    return (await SecureStore.getItemAsync(BIOMETRIC_LOCK_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_LOCK_KEY, "1");
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_LOCK_KEY);
  }
}

export async function hasBiometricHardware(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const [hasHardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);

  return hasHardware && enrolled;
}

/** Prompts for biometrics. Fails OPEN (returns true) where biometrics are unavailable so the user is never hard-locked out. */
export async function authenticateAppLock(promptMessage: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  try {
    if (!(await hasBiometricHardware())) {
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: "Cancel" });
    return result.success;
  } catch {
    return true;
  }
}
