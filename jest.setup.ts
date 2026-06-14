import type { ReactNode } from "react";

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
