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

/**
 * Prompts for biometrics. Fails OPEN (returns true) ONLY where biometrics are
 * genuinely unavailable (web, or no hardware/enrollment) so the user is never
 * hard-locked out. When biometrics ARE available but the prompt itself errors,
 * fails CLOSED (returns false) so a transient error can't silently unlock.
 */
export async function authenticateAppLock(promptMessage: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  let biometricsAvailable = false;
  try {
    biometricsAvailable = await hasBiometricHardware();
  } catch {
    // Can't even determine hardware state — don't brick the user; treat as
    // unavailable (no biometric lock can be enforced on this device).
    return true;
  }

  if (!biometricsAvailable) {
    return true;
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: "Cancel" });
    return result.success;
  } catch {
    // Hardware/enrollment exists but the prompt errored — hold at the lock
    // screen rather than granting access.
    return false;
  }
}
