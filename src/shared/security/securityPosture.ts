import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

export type SecurityControl =
  | "certificate_pinning"
  | "device_integrity"
  | "device_authenticity"
  | "debug_build"
  | "network_policy";
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

/**
 * Evaluates the runtime security posture. Some controls are genuinely enforced
 * here (HTTPS + host allowlist via networkSecurity; physical-device detection
 * via expo-device); the transport- and OS-level attestation controls
 * (certificate pinning, Play Integrity / App Attest) require a standalone native
 * build plus a server verifier — see docs/security-hardening.md. Findings are
 * honest about which is which, and `*_REQUIRED` flags escalate the unmet ones to
 * `critical`, which blocks the app when enforcement mode is `block`.
 */
export function evaluateSecurityPosture(): SecurityPosture {
  const findings: SecurityFinding[] = [
    {
      control: "network_policy",
      severity: "info",
      message: "Enforced: client rejects non-HTTPS requests and restricts traffic to the Supabase host allowlist.",
    },
  ];

  const isStandalone = Constants.executionEnvironment === ExecutionEnvironment.Standalone;

  if (__DEV__ || Constants.debugMode) {
    findings.push({
      control: "debug_build",
      severity: "warning",
      message: "Debug build detected. Production integrity must be validated in a release build.",
    });
  }

  // Genuine integrity signal: a physical device vs an emulator/simulator.
  if (Platform.OS !== "web" && !Device.isDevice) {
    findings.push({
      control: "device_authenticity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Enforced: this is an emulator/simulator, not a physical device.",
    });
  }

  if (Platform.OS === "web") {
    findings.push({
      control: "device_integrity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Device attestation is unavailable on web.",
    });
    findings.push({
      control: "certificate_pinning",
      severity: nativePinningRequired ? "critical" : "warning",
      message: "Certificate pinning is unavailable on web.",
    });
  } else if (!isStandalone) {
    findings.push({
      control: "device_integrity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Play Integrity / App Attest require a standalone build and a server attestation endpoint (inactive in Expo Go / dev client).",
    });
    findings.push({
      control: "certificate_pinning",
      severity: nativePinningRequired ? "critical" : "warning",
      message: "Certificate pinning requires a standalone build with the committed network-security-config and real SPKI hashes (inactive in Expo Go / dev client).",
    });
  } else {
    findings.push({
      control: "device_integrity",
      severity: deviceIntegrityRequired ? "critical" : "warning",
      message: "Server attestation endpoint for Play Integrity / App Attest is not configured (see docs/security-hardening.md).",
    });
    findings.push({
      control: "certificate_pinning",
      severity: nativePinningRequired ? "critical" : "warning",
      message: "Add real SPKI pin hashes to the network-security-config to activate pinning (see docs/security-hardening.md).",
    });
  }

  return {
    canUseNetwork: enforcementMode === "report" || findings.every((finding) => finding.severity !== "critical"),
    findings,
  };
}
