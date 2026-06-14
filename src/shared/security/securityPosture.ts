import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

export type SecurityControl = "certificate_pinning" | "device_integrity" | "debug_build" | "network_policy";
export type SecurityFindingSeverity = "info" | "warning" | "critical";

export type SecurityFinding = {
  control: SecurityControl;
  severity: SecurityFindingSeverity;
  message: string;
};

export type SecurityPosture = {
  canUseNetwork: boolean;
  findings: SecurityFinding[];
};

const enforcementMode = process.env.EXPO_PUBLIC_SECURITY_ENFORCEMENT_MODE === "block" ? "block" : "report";
const nativePinningRequired = process.env.EXPO_PUBLIC_NATIVE_CERT_PINNING_REQUIRED === "true";
const deviceIntegrityRequired = process.env.EXPO_PUBLIC_DEVICE_INTEGRITY_REQUIRED === "true";

export function evaluateSecurityPosture(): SecurityPosture {
  const findings: SecurityFinding[] = [
    {
      control: "network_policy",
      severity: "info",
      message: "Client network policy enforces HTTPS and the configured Supabase host allowlist.",
    },
  ];

  if (__DEV__ || Constants.debugMode) {
    findings.push({
      control: "debug_build",
      severity: "warning",
      message: "Debug build detected. Production integrity decisions must be validated in a release build.",
    });
  }

  if (Platform.OS === "web") {
    findings.push({
      control: "device_integrity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Device integrity attestation is unavailable on web.",
    });
    findings.push({
      control: "certificate_pinning",
      severity: nativePinningRequired ? "critical" : "warning",
      message: "Native certificate pinning is unavailable on web.",
    });
  } else if (Constants.executionEnvironment !== ExecutionEnvironment.Standalone) {
    findings.push({
      control: "device_integrity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Play Integrity, App Attest, and DeviceCheck require a standalone native build and server attestation endpoint.",
    });
    findings.push({
      control: "certificate_pinning",
      severity: nativePinningRequired ? "critical" : "warning",
      message: "Native certificate pinning cannot be enforced in Expo Go or the web runtime.",
    });
  } else {
    findings.push({
      control: "device_integrity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Native device attestation endpoint is not configured in this phase.",
    });
    findings.push({
      control: "certificate_pinning",
      severity: nativePinningRequired ? "critical" : "warning",
      message: "Native certificate pinning module is not configured in this phase.",
    });
  }

  return {
    canUseNetwork: enforcementMode === "report" || findings.every((finding) => finding.severity !== "critical"),
    findings,
  };
}
