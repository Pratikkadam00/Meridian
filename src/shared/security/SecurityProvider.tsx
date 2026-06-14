import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Sentry } from "@/shared/observability/sentry";
import { tokens } from "@/shared/theme/tokens";
import { Text } from "@/shared/ui/Text";

import { evaluateSecurityPosture, type SecurityPosture } from "./securityPosture";

type SecurityContextValue = {
  posture: SecurityPosture;
};

const SecurityContext = createContext<SecurityContextValue | null>(null);

export function SecurityProvider({ children }: PropsWithChildren) {
  const posture = useMemo(() => evaluateSecurityPosture(), []);

  useEffect(() => {
    Sentry.setContext("security_posture", {
      canUseNetwork: posture.canUseNetwork,
      findings: posture.findings.map((finding) => `${finding.severity}:${finding.control}`),
    });

    posture.findings
      .filter((finding) => finding.severity === "critical")
      .forEach((finding) => {
        Sentry.captureMessage(`Security posture critical: ${finding.control}`, {
          level: "error",
          tags: {
            security_control: finding.control,
          },
        });
      });
  }, [posture]);

  if (!posture.canUseNetwork) {
    return (
      <View style={styles.blocked}>
        <View style={styles.panel}>
          <Text variant="eyebrow">Security check</Text>
          <Text variant="h1" style={styles.title}>
            Build not trusted
          </Text>
          <Text variant="body" muted>
            This build requires native security controls that are not available in the current runtime.
          </Text>
        </View>
      </View>
    );
  }

  return <SecurityContext.Provider value={{ posture }}>{children}</SecurityContext.Provider>;
}

export function useSecurityPosture() {
  const value = useContext(SecurityContext);

  if (!value) {
    throw new Error("useSecurityPosture must be used inside SecurityProvider");
  }

  return value.posture;
}

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    justifyContent: "center",
    padding: tokens.spacing[22],
    backgroundColor: tokens.colors.bg,
  },
  panel: {
    borderWidth: 1,
    borderColor: tokens.colors.over,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[22],
  },
  title: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[12],
  },
});
