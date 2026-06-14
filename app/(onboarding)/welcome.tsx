import { Link } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

import { OnboardingStepView, useOnboardingStepTracking } from "@/features/onboarding";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { tokens } from "@/shared/theme/tokens";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Screen } from "@/shared/ui/Screen";
import { SegmentedControl } from "@/shared/ui/SelectableControls";
import { Text } from "@/shared/ui/Text";

const beats = [
  {
    title: "Track every milestone, booking to handover.",
    body: "Drop the SPA, we read the payment plan. Reminders fire before every DLD deadline. Your whole portfolio, in one glance.",
  },
  {
    title: "Drop the SPA, we read it.",
    body: "Turn a payment plan into clean booking, DLD/Oqood, construction, and handover milestones before the deal slips.",
  },
  {
    title: "Never miss a handover.",
    body: "Get nudges before every payment is due and keep the week ahead visible while you move between clients.",
  },
];

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useI18nControls();
  const { width } = useWindowDimensions();
  const carouselRef = useRef<ScrollView>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  useOnboardingStepTracking("welcome", 1);

  const pageWidth = Math.max(width - tokens.spacing[22] * 2, 1);

  function handleMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveBeat(Math.max(0, Math.min(index, beats.length - 1)));
  }

  function goToBeat(index: number) {
    setActiveBeat(index);
    carouselRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  }

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <OnboardingStepView>
        <View style={styles.hero}>
          <Text variant="eyebrow">{t("welcome.eyebrow")}</Text>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            scrollEventThrottle={16}
            style={styles.carousel}
          >
            {beats.map((beat) => (
              <View key={beat.title} style={[styles.beat, { width: pageWidth }]}>
                <Text variant="display" style={styles.title}>
                  {beat.title}
                </Text>
                <Text variant="body" muted style={styles.lede}>
                  {beat.body}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <View style={styles.beatDots}>
            {beats.map((beat, index) => (
              <PressableScale
                key={beat.title}
                accessibilityLabel={`Show value ${index + 1}`}
                selected={activeBeat === index}
                focusRadius={tokens.radius.pill}
                pressScale={tokens.control.optionChip.pressScale}
                onPress={() => goToBeat(index)}
                pressableStyle={[styles.beatDot, activeBeat === index && styles.beatDotOn]}
              >
                <View />
              </PressableScale>
            ))}
          </View>
          <SegmentedControl
            options={["en", "ar"] as const}
            labels={{ en: "English", ar: "العربية" }}
            value={language}
            onChange={setLanguage}
            accessibilityLabel="Language"
            style={styles.languageRow}
          />
          <Link href="/account" asChild>
            <GoldButton label={t("welcome.primaryCta")} />
          </Link>
          <Link href={{ pathname: "/account", params: { mode: "sign-in" } }} asChild>
            <GhostButton label={t("welcome.secondaryCta")} />
          </Link>
        </View>
      </OnboardingStepView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "flex-end",
  },
  rtl: {
    direction: "rtl",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
  },
  carousel: {
    flexGrow: 0,
  },
  beat: {
    paddingRight: tokens.spacing[16],
  },
  title: {
    marginTop: tokens.spacing[12],
    maxWidth: 340,
  },
  lede: {
    marginTop: tokens.spacing[16],
    maxWidth: 330,
  },
  footer: {
    gap: tokens.spacing[12],
  },
  beatDots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: tokens.spacing[8],
  },
  beatDot: {
    width: 10,
    height: 4,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.line,
  },
  beatDotOn: {
    width: 24,
    backgroundColor: tokens.colors.accent,
  },
  languageRow: {
    marginBottom: tokens.spacing[4],
  },
});
