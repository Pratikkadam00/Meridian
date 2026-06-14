import { StatsigProviderRN, useGateValue } from "@statsig/react-native-bindings";
import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

export type FeatureFlagKey = "ai_spa_extraction" | "push_reminders" | "whatsapp_reminders";

type FeatureFlagContextValue = {
  isEnabled: (flag: FeatureFlagKey) => boolean;
};

const defaultFlags: Record<FeatureFlagKey, boolean> = {
  ai_spa_extraction: true,
  push_reminders: true,
  whatsapp_reminders: true,
};

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  isEnabled: (flag) => defaultFlags[flag],
});

const statsigClientKey = process.env.EXPO_PUBLIC_STATSIG_CLIENT_KEY;

export function FeatureFlagProvider({ children }: PropsWithChildren) {
  const localFlags = useMemo(() => buildLocalFlags(), []);

  if (statsigClientKey) {
    return (
      <StatsigProviderRN sdkKey={statsigClientKey} user={{ userID: "anonymous-meridian-client" }}>
        <StatsigFeatureFlagProvider>{children}</StatsigFeatureFlagProvider>
      </StatsigProviderRN>
    );
  }

  return <LocalFeatureFlagProvider localFlags={localFlags}>{children}</LocalFeatureFlagProvider>;
}

export function useFeatureFlag(flag: FeatureFlagKey) {
  const context = useContext(FeatureFlagContext);

  return context.isEnabled(flag);
}

function LocalFeatureFlagProvider({ children, localFlags }: PropsWithChildren<{ localFlags: Record<FeatureFlagKey, boolean> }>) {
  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      isEnabled: (flag) => localFlags[flag],
    }),
    [localFlags],
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

function StatsigFeatureFlagProvider({ children }: PropsWithChildren) {
  const aiSpaExtraction = useGateValue("ai_spa_extraction");
  const pushReminders = useGateValue("push_reminders");
  const whatsappReminders = useGateValue("whatsapp_reminders");
  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      isEnabled: (flag) => {
        switch (flag) {
          case "ai_spa_extraction":
            return aiSpaExtraction;
          case "push_reminders":
            return pushReminders;
          case "whatsapp_reminders":
            return whatsappReminders;
        }
      },
    }),
    [aiSpaExtraction, pushReminders, whatsappReminders],
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

function buildLocalFlags(): Record<FeatureFlagKey, boolean> {
  return {
    ai_spa_extraction: envFlag(process.env.EXPO_PUBLIC_FEATURE_AI_SPA_EXTRACTION, defaultFlags.ai_spa_extraction),
    push_reminders: envFlag(process.env.EXPO_PUBLIC_FEATURE_PUSH_REMINDERS, defaultFlags.push_reminders),
    whatsapp_reminders: envFlag(process.env.EXPO_PUBLIC_FEATURE_WHATSAPP_REMINDERS, defaultFlags.whatsapp_reminders),
  };
}

function envFlag(value: string | undefined, fallback: boolean) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}
