import * as Localization from "expo-localization";
import i18next, { changeLanguage, use as registerI18nPlugin } from "i18next";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { I18nManager, Platform } from "react-native";
import { initReactI18next } from "react-i18next";

import { resources, type SupportedLanguage } from "./translations";

const defaultLanguage: SupportedLanguage = Localization.getLocales()[0]?.languageCode === "ar" ? "ar" : "en";

const { isInitialized } = i18next;

if (!isInitialized) {
  void registerI18nPlugin(initReactI18next).init({
    compatibilityJSON: "v4",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    lng: defaultLanguage,
    resources,
  });
}

// Native layout direction (flex rows, margins, absolute offsets) only mirrors
// after the bridge restarts, so a direction change must be followed by a reload.
async function applyRtlAndReload(shouldBeRTL: boolean) {
  I18nManager.allowRTL(true);

  if (I18nManager.isRTL === shouldBeRTL) {
    return;
  }

  I18nManager.forceRTL(shouldBeRTL);

  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      return;
    }

    const Updates = await import("expo-updates");
    await Updates.reloadAsync();
  } catch {
    // Reload unavailable (e.g. dev client without expo-updates) — text has
    // already switched; native mirroring applies on the next app start.
  }
}

type I18nControls = {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (language: SupportedLanguage) => void;
};

const I18nContext = createContext<I18nControls | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  // On an Arabic-locale device, force native RTL at startup (otherwise the app
  // boots Arabic text in an LTR layout).
  useEffect(() => {
    void applyRtlAndReload(defaultLanguage === "ar");
  }, []);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);
    void changeLanguage(nextLanguage);
    void applyRtlAndReload(nextLanguage === "ar");
  }, []);

  const value = useMemo<I18nControls>(
    () => ({
      language,
      isRTL: language === "ar",
      setLanguage,
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nControls() {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18nControls must be used inside I18nProvider");
  }

  return value;
}
