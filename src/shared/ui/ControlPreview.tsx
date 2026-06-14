import { Bell, Building2, Check, ChevronLeft, Home, Layers3, MoreHorizontal, Plus, UserRound, X } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { tokens } from "@/shared/theme/tokens";

import { Button } from "./Button";
import { Fab } from "./Fab";
import { FloatingNav, type FloatingNavItem } from "./FloatingNav";
import { IconButton } from "./IconButton";
import { Screen } from "./Screen";
import { SegmentedControl, OptionCard, OptionChip } from "./SelectableControls";
import { SocialButton } from "./SocialButton";
import { StatusChip } from "./StatusChip";
import { Surface } from "./Surface";
import { Text } from "./Text";

type PreviewNavKey = "home" | "deals" | "reminders";

const volumeOptions = ["1-5", "6-15", "16+"] as const;
const previewNavItems: FloatingNavItem<PreviewNavKey>[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "deals", label: "Deals", icon: Layers3 },
  { key: "reminders", label: "Reminders", icon: Bell },
];

export function ControlPreview() {
  const [volume, setVolume] = useState<(typeof volumeOptions)[number]>("1-5");
  const [activeNav, setActiveNav] = useState<PreviewNavKey>("home");

  return (
    <Screen contentStyle={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text variant="eyebrow">Phase A</Text>
        <Text variant="h1" style={styles.title}>
          Button and control system
        </Text>
        <Text variant="body" muted style={styles.lede}>
          Midnight controls rendered from shared UI components.
        </Text>

        <PreviewSection eyebrow="01" title="Button variants">
          <Button label="Get started" variant="gold" />
          <Button label="Get started" variant="gold" loading loadingLabel="Saving" />
          <Button label="Continue" variant="gold" disabled />
          <Button label="I already have an account" variant="ghost" />
          <Button label="Sign in" variant="text" />
          <Button label="Delete deal" variant="danger" size="md" />
          <Button label="Delete deal" variant="danger" size="md" solid />
        </PreviewSection>

        <PreviewSection eyebrow="02" title="Button sizes">
          <View style={styles.row}>
            <Button label="Large" size="lg" variant="gold" />
            <Button label="Medium" size="md" variant="gold" />
            <Button label="Small" size="sm" variant="gold" />
          </View>
        </PreviewSection>

        <PreviewSection eyebrow="03" title="Icon buttons and FAB">
          <View style={styles.iconRow}>
            <IconButton icon={ChevronLeft} label="Back" />
            <IconButton icon={Plus} label="Add" />
            <IconButton icon={X} label="Close" />
            <IconButton icon={MoreHorizontal} label="More" />
            <IconButton icon={ChevronLeft} label="Back circle" variant="circle" />
            <IconButton icon={Plus} label="Add gold" variant="gold" />
            <Fab label="Create deal" />
          </View>
        </PreviewSection>

        <PreviewSection eyebrow="04" title="Auth buttons">
          <SocialButton provider="apple" />
          <SocialButton provider="google" />
        </PreviewSection>

        <PreviewSection eyebrow="05" title="Selectors">
          <OptionCard title="Solo broker" subtitle="Just me, my own deals" icon={UserRound} selected onPress={() => undefined} />
          <OptionCard title="Part of a brokerage" subtitle="A team of agents" icon={Building2} onPress={() => undefined} />
          <View style={styles.chips}>
            <OptionChip label="Emaar" selected onPress={() => undefined} />
            <OptionChip label="Damac" selected onPress={() => undefined} />
            <OptionChip label="Sobha" onPress={() => undefined} />
            <OptionChip label="+ Add" onPress={() => undefined} />
          </View>
          <SegmentedControl options={volumeOptions} value={volume} onChange={setVolume} />
        </PreviewSection>

        <PreviewSection eyebrow="06" title="Status and surfaces">
          <View style={styles.chips}>
            <StatusChip label="Due in 5 days" variant="due" />
            <StatusChip label="On track" variant="ok" />
            <StatusChip label="Overdue 6d" variant="over" />
          </View>
          <Surface style={styles.surface}>
            <Text variant="cardTitle" style={styles.surfaceTitle}>
              Panel surface
            </Text>
            <Text variant="caption" muted>
              Uses the shared panel token.
            </Text>
          </Surface>
          <Surface variant="card-due" style={styles.surface}>
            <Text variant="eyebrow">Emaar - Beachfront</Text>
            <Text variant="cardTitle" style={styles.surfaceTitle}>
              Marina Vista - 2BR
            </Text>
            <StatusChip label="Due in 5 days" variant="due" />
          </Surface>
        </PreviewSection>

        <PreviewSection eyebrow="07" title="Floating nav">
          <View style={styles.navMock}>
            <Surface variant="card" style={styles.navCard}>
              <Check size={22} color={tokens.colors.accent} />
            </Surface>
            <FloatingNav activeKey={activeNav} items={previewNavItems} onFabPress={() => undefined} onItemPress={(item) => setActiveNav(item.key)} />
          </View>
        </PreviewSection>
      </ScrollView>
    </Screen>
  );
}

function PreviewSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="mono" style={styles.sectionNumber}>
          {eyebrow}
        </Text>
        <Text variant="cardTitle" style={styles.sectionTitle}>
          {title}
        </Text>
      </View>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: tokens.spacing[32],
  },
  content: {
    paddingBottom: tokens.layout.appScreenBottomPadding,
  },
  title: {
    marginTop: tokens.spacing[8],
  },
  lede: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[22],
  },
  section: {
    marginBottom: tokens.spacing[32],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: tokens.spacing[12],
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.line,
    paddingBottom: tokens.spacing[8],
    marginBottom: tokens.spacing[16],
  },
  sectionNumber: {
    color: tokens.colors.accent,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 19,
    lineHeight: 24,
  },
  stack: {
    gap: tokens.spacing[12],
  },
  row: {
    alignItems: "flex-start",
    gap: tokens.spacing[12],
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: tokens.spacing[12],
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  surface: {
    padding: tokens.spacing[16],
  },
  surfaceTitle: {
    fontSize: 18,
    lineHeight: 23,
    marginBottom: tokens.spacing[8],
  },
  navMock: {
    position: "relative",
    height: 220,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.deck,
    backgroundColor: tokens.colors.bg,
  },
  navCard: {
    position: "absolute",
    top: tokens.spacing[22],
    right: tokens.spacing[22],
    left: tokens.spacing[22],
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.74,
  },
});
