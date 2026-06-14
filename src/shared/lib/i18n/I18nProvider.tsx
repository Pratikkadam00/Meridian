import * as Localization from "expo-localization";
import i18next, { changeLanguage, use as registerI18nPlugin } from "i18next";
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { I18nManager } from "react-native";
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

type I18nControls = {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (language: SupportedLanguage) => void;
};

const I18nContext = createContext<I18nControls | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    const nextIsRTL = nextLanguage === "ar";
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(nextIsRTL);
    setLanguageState(nextLanguage);
    void changeLanguage(nextLanguage);
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
