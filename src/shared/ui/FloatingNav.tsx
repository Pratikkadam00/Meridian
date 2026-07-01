import { BlurView } from "expo-blur";
import type { LucideIcon } from "lucide-react-native";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

import { Fab } from "./Fab";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

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
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  onFabPress?: () => void;
  onItemPress: (item: FloatingNavItem<TKey>) => void;
};

// Bottom tab bar: blurred translucent bar with a top hairline; the active tab
// gets a jade-50 pill behind its icon + jade label (package TabBar). The "new
// deal" FAB docks bottom-right above the bar.
export function FloatingNav<TKey extends string>({
  items,
  activeKey,
  variant = "with-fab",
  fabIcon,
  fabLabel = "New deal",
  hidden = false,
  isRTL = false,
  style,
  onFabPress,
  onItemPress,
}: FloatingNavProps<TKey>) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hasFab = variant === "with-fab" && Boolean(onFabPress);

  if (hidden) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { direction: isRTL ? "rtl" : "ltr" }, style]}>
      <BlurView
        intensity={42}
        tint={theme.name === "dark" ? "dark" : "light"}
        blurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
        style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}
      >
        {items.map((item) => (
          <NavItem key={item.key} item={item} selected={item.key === activeKey} onPress={() => onItemPress(item)} />
        ))}
      </BlurView>

      {hasFab ? <Fab accessibilityLabel={fabLabel} icon={fabIcon} label={fabLabel} onPress={onFabPress} style={[styles.fab, { bottom: Math.max(insets.bottom, 8) + 64 }]} /> : null}
    </View>
  );
}

function NavItem<TKey extends string>({ item, selected, onPress }: { item: FloatingNavItem<TKey>; selected: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const Icon = item.icon;
  const color = selected ? theme.color.actionText : theme.color.textTertiary;

  return (
    <PressableScale
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      focusRadius={theme.radius.sm}
      haptic
      onPress={onPress}
      outerStyle={styles.navItemWrap}
      pressScale={0.94}
      pressableStyle={styles.navItem}
      selected={selected}
    >
      <View style={[styles.navIcon, selected && styles.navIconActive]}>
        <Icon size={22} color={color} strokeWidth={selected ? 2.3 : 2} />
      </View>
      <Text variant="caption" style={[styles.navLabel, { color }]}>
        {item.label}
      </Text>
    </PressableScale>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
    },
    bar: {
      flexDirection: "row",
      alignItems: "stretch",
      paddingTop: 8,
      paddingHorizontal: t.space[3],
      borderTopWidth: 1,
      borderTopColor: t.color.borderHair,
      backgroundColor: t.name === "dark" ? "rgba(16,58,53,0.82)" : "rgba(255,255,255,0.82)",
    },
    navItemWrap: {
      flex: 1,
    },
    navItem: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      paddingVertical: 6,
    },
    navIcon: {
      width: 48,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: t.radius.pill,
    },
    navIconActive: {
      backgroundColor: t.color.selectedTint,
    },
    navLabel: {
      fontSize: 11,
      lineHeight: 13,
      fontFamily: t.typography.family.uiMedium,
    },
    fab: {
      position: "absolute",
      end: 16, // logical trailing edge — mirrors to the leading side under RTL
    },
  });
