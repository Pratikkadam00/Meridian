/* eslint-disable react-hooks/immutability */
import * as Haptics from "expo-haptics";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useTheme } from "@/shared/theme/ThemeProvider";

const PRESS_MS = 120;
const FOCUS_OFFSET = 3;
const FOCUS_WIDTH = 2;
const DISABLED_OPACITY = 0.45;

type PressableScaleProps = Omit<PressableProps, "children" | "style" | "disabled" | "onPress"> & {
  children: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  selected?: boolean;
  haptic?: boolean;
  focusRadius: number;
  pressScale: number;
  /** When set, a translucent overlay of this color brightens/lifts the control on press. */
  pressOverlayColor?: string;
  outerStyle?: StyleProp<ViewStyle>;
  pressableStyle?: StyleProp<ViewStyle>;
  onPress?: ((event: GestureResponderEvent) => void) | null;
};

export function PressableScale({
  children,
  disabled = false,
  busy = false,
  selected,
  haptic = false,
  focusRadius,
  pressScale,
  pressOverlayColor,
  outerStyle,
  pressableStyle,
  accessibilityState,
  onPress,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  ...props
}: PressableScaleProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const overlay = useSharedValue(0);
  const blocked = disabled || busy;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value * 0.18,
  }));

  function pressIn(event: GestureResponderEvent) {
    if (!blocked && !reducedMotion) {
      scale.value = withTiming(pressScale, { duration: PRESS_MS });
      overlay.value = withTiming(1, { duration: PRESS_MS });
    }

    onPressIn?.(event);
  }

  function pressOut(event: GestureResponderEvent) {
    if (!blocked && !reducedMotion) {
      scale.value = withTiming(1, { duration: PRESS_MS });
      overlay.value = withTiming(0, { duration: PRESS_MS });
    }

    onPressOut?.(event);
  }

  function press(event: GestureResponderEvent) {
    if (blocked) {
      return;
    }

    if (haptic) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    onPress?.(event);
  }

  return (
    <Animated.View style={[styles.wrap, blocked && styles.disabled, animatedStyle, outerStyle]}>
      {focused ? (
        <Animated.View pointerEvents="none" style={[styles.focusRing, { borderRadius: focusRadius, borderColor: theme.color.focusRing }]} />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ ...accessibilityState, busy, disabled: blocked, selected }}
        disabled={blocked}
        focusable={!blocked}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onPress={press}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={pressableStyle}
        {...props}
      >
        {pressOverlayColor ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: pressOverlayColor }, overlayStyle]} /> : null}
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  focusRing: {
    position: "absolute",
    top: -FOCUS_OFFSET,
    right: -FOCUS_OFFSET,
    bottom: -FOCUS_OFFSET,
    left: -FOCUS_OFFSET,
    borderWidth: FOCUS_WIDTH,
  },
});
