import i18next from "i18next";
import type { ReactNode } from "react";

import { resources } from "./src/shared/lib/i18n/translations";

// The data layer localizes deal display strings via the i18next singleton.
// Tests don't mount I18nProvider (which normally initializes it), so init the
// English bundle here — t() then returns real strings instead of raw keys.
if (!i18next.isInitialized) {
  void i18next.init({
    compatibilityJSON: "v4",
    fallbackLng: "en",
    lng: "en",
    interpolation: { escapeValue: false },
    resources,
  });
}

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    View,
    runOnJS: (fn: unknown) => fn,
    useAnimatedStyle: (worklet: () => object) => worklet(),
    useReducedMotion: () => false,
    useSharedValue: (value: unknown) => ({ value }),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

jest.mock("@statsig/react-native-bindings", () => ({
  StatsigProviderRN: ({ children }: { children: ReactNode }) => children,
  useGateValue: () => false,
}));

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  wrap: (component: unknown) => component,
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
  startInactiveSpan: jest.fn(() => ({
    end: jest.fn(),
    setAttributes: jest.fn(),
  })),
}));
