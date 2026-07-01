import { Link } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

import { OnboardingStepView, useOnboardingStepTracking } from "@/features/onboarding";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Screen } from "@/shared/ui/Screen";
import { SegmentedControl } from "@/shared/ui/SelectableControls";
import { Text } from "@/shared/ui/Text";

type Beat = { title: string; body: string };

const SCREEN_PAD = 20;

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useI18nControls();
  const { width } = useWindowDimensions();
  const styles = useThemedStyles(makeStyles);
  const carouselRef = useRef<ScrollView>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  useOnboardingStepTracking("welcome", 1);

  const beats = t("welcome.beats", { returnObjects: true }) as Beat[];

  const pageWidth = Math.max(width - SCREEN_PAD * 2, 1);

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
                accessibilityLabel={t("welcome.beatDotA11y", { index: index + 1 })}
                accessibilityRole="tab"
                selected={activeBeat === index}
                focusRadius={999}
                pressScale={0.98}
                hitSlop={{ top: 20, bottom: 20, left: 8, right: 8 }}
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
            accessibilityLabel={t("welcome.languageA11y")}
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

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
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
      paddingRight: t.space[4],
    },
    title: {
      marginTop: t.space[3],
      maxWidth: 340,
    },
    lede: {
      marginTop: t.space[4],
      maxWidth: 330,
    },
    footer: {
      gap: t.space[3],
    },
    beatDots: {
      flexDirection: "row",
      gap: 6,
      marginBottom: t.space[2],
    },
    beatDot: {
      width: 10,
      height: 4,
      borderRadius: t.radius.pill,
      backgroundColor: t.color.borderStrong,
    },
    beatDotOn: {
      width: 24,
      backgroundColor: t.color.action,
    },
    languageRow: {
      marginBottom: t.space[1],
    },
  });
