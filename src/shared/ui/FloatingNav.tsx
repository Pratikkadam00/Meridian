import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tokens } from "@/shared/theme/tokens";

import { Fab } from "./Fab";
import { PressableScale } from "./PressableScale";

export type FloatingNavItem<TKey extends string = string> = {
  key: TKey;
  label: string;
  icon: LucideIcon;
};

export type FloatingNavVariant = "with-fab" | "even";

type FloatingNavProps<TKey extends string = string> = {
  items: readonly FloatingNavItem<TKey>[];
  activeKey: TKey | null;
  variant?: FloatingNavVariant;
  fabIcon?: LucideIcon;
  fabLabel?: string;
  hidden?: boolean;
  style?: StyleProp<ViewStyle>;
  onFabPress?: () => void;
  onItemPress: (item: FloatingNavItem<TKey>) => void;
};

export function FloatingNav<TKey extends string>({
  items,
  activeKey,
  variant = "with-fab",
  fabIcon,
  fabLabel = "New deal",
  hidden = false,
  style,
  onFabPress,
  onItemPress,
}: FloatingNavProps<TKey>) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const indicatorX = useSharedValue(0);
  const indicatorVisible = useSharedValue(0);
  const [positions, setPositions] = useState<Partial<Record<TKey, number>>>({});
  const navBottom = useMemo(() => Math.max(insets.bottom, 0) + tokens.layout.floatingNavBottomOffset, [insets.bottom]);
  const hasFab = variant === "with-fab" && Boolean(onFabPress);
  const splitIndex = Math.floor(items.length / 2);

  useEffect(() => {
    if (!activeKey || positions[activeKey] === undefined) {
      indicatorVisible.value = withTiming(0, { duration: tokens.control.pressDurationMs });
      return;
    }

    indicatorVisible.value = withTiming(1, { duration: reducedMotion ? tokens.control.pressDurationMs : 160 });
    indicatorX.value = reducedMotion ? withTiming(positions[activeKey] ?? 0, { duration: tokens.control.pressDurationMs }) : withSpring(positions[activeKey] ?? 0, tokens.motion.navSpring);
  }, [activeKey, indicatorVisible, indicatorX, positions, reducedMotion]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorVisible.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  if (hidden) {
    return null;
  }

  function handleItemLayout(key: TKey, event: LayoutChangeEvent) {
    const nextX = event.nativeEvent.layout.x;
    setPositions((current) => (current[key] === nextX ? current : { ...current, [key]: nextX }));
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: navBottom }, style]}>
      <View style={styles.shell}>
        <BlurView intensity={58} tint="dark" blurMethod={Platform.OS === "android" ? "none" : undefined} style={styles.blur}>
          <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]}>
            <LinearGradient colors={[tokens.colors.navIndicatorStart, tokens.colors.navIndicatorEnd]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.indicatorFill} />
          </Animated.View>

          <View style={[styles.row, variant === "even" && styles.rowEven]}>
            {items.map((item, index) => (
              <Fragment key={item.key}>
                {hasFab && index === splitIndex ? <View style={styles.centerGap} /> : null}
                <NavItem item={item} selected={item.key === activeKey} onLayout={(event) => handleItemLayout(item.key, event)} onPress={() => onItemPress(item)} />
              </Fragment>
            ))}
          </View>
        </BlurView>

        {hasFab ? <Fab accessibilityLabel={fabLabel} icon={fabIcon} label={fabLabel} onPress={onFabPress} style={styles.fab} /> : null}
      </View>
    </View>
  );
}

function NavItem<TKey extends string>({ item, selected, onLayout, onPress }: { item: FloatingNavItem<TKey>; selected: boolean; onLayout: (event: LayoutChangeEvent) => void; onPress: () => void }) {
  const Icon = item.icon;

  return (
    <PressableScale
      accessibilityLabel={item.label}
      focusRadius={tokens.layout.floatingNavIndicatorRadius + tokens.control.focusRingOffset}
      haptic
      onLayout={onLayout}
      onPress={onPress}
      outerStyle={styles.navItemWrap}
      pressScale={tokens.control.iconButton.pressScale}
      pressableStyle={styles.navItem}
      selected={selected}
    >
      <View style={selected && styles.navItemActive}>
        <Icon size={21} color={selected ? tokens.colors.goldBright : tokens.colors.muted} strokeWidth={selected ? 2.4 : 2.1} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
  shell: {
    width: tokens.layout.floatingNavWidthPercent,
    maxWidth: tokens.layout.floatingNavMaxWidth,
    height: tokens.layout.floatingNavHeight,
    borderRadius: tokens.radius.nav,
    shadowColor: tokens.colors.black,
    shadowOpacity: 0.55,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18,
  },
  blur: {
    flex: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: tokens.colors.navBorder,
    borderRadius: tokens.radius.nav,
    backgroundColor: tokens.colors.navSurface,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.layout.floatingNavPaddingX,
  },
  rowEven: {
    justifyContent: "space-around",
  },
  centerGap: {
    width: tokens.layout.floatingNavFabSize + tokens.spacing[16],
    height: tokens.layout.floatingNavIconSize,
  },
  navItemWrap: {
    width: tokens.layout.floatingNavIconSize,
    height: tokens.layout.floatingNavIconSize,
  },
  navItem: {
    width: tokens.layout.floatingNavIconSize,
    height: tokens.layout.floatingNavIconSize,
    alignItems: "center",
    justifyContent: "center",
  },
  navItemActive: {
    transform: [{ translateY: -1 }],
  },
  indicator: {
    position: "absolute",
    top: tokens.layout.floatingNavIndicatorTop,
    left: tokens.layout.floatingNavPaddingX,
    width: tokens.layout.floatingNavIconSize,
    height: tokens.layout.floatingNavIconSize,
    borderRadius: tokens.layout.floatingNavIndicatorRadius,
    overflow: "hidden",
  },
  indicatorFill: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    top: tokens.layout.floatingNavFabTop,
    left: "50%",
    marginLeft: -tokens.layout.floatingNavFabSize / 2,
  },
});
