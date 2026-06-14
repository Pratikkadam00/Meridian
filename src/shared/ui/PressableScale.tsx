/* eslint-disable react-hooks/immutability */
import * as Haptics from "expo-haptics";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { tokens } from "@/shared/theme/tokens";

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
      scale.value = withTiming(pressScale, { duration: tokens.control.pressDurationMs });
      overlay.value = withTiming(1, { duration: tokens.control.pressDurationMs });
    }

    onPressIn?.(event);
  }

  function pressOut(event: GestureResponderEvent) {
    if (!blocked && !reducedMotion) {
      scale.value = withTiming(1, { duration: tokens.control.pressDurationMs });
      overlay.value = withTiming(0, { duration: tokens.control.pressDurationMs });
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
      {focused ? <Animated.View pointerEvents="none" style={[styles.focusRing, { borderRadius: focusRadius }]} /> : null}
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
    opacity: tokens.control.disabledOpacity,
  },
  focusRing: {
    position: "absolute",
    top: -tokens.control.focusRingOffset,
    right: -tokens.control.focusRingOffset,
    bottom: -tokens.control.focusRingOffset,
    left: -tokens.control.focusRingOffset,
    borderWidth: tokens.control.focusRingWidth,
    borderColor: tokens.colors.accent,
  },
});
