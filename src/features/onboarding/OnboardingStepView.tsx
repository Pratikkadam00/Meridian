import { MotiView } from "moti";
import { type PropsWithChildren } from "react";
import { useReducedMotion } from "react-native-reanimated";

type OnboardingStepViewProps = PropsWithChildren<{
  reverse?: boolean;
}>;

export function OnboardingStepView({ children, reverse = false }: OnboardingStepViewProps) {
  const reducedMotion = useReducedMotion();

  return (
    <MotiView
      from={{ opacity: 0, translateX: reducedMotion ? 0 : reverse ? -24 : 24 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: reducedMotion ? 180 : 360 }}
      style={{ flex: 1 }}
    >
      {children}
    </MotiView>
  );
}
