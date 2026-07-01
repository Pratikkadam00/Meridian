import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

import { Text } from "./Text";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, onFocus, onBlur, accessibilityLabel, ...props }: InputProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text variant="caption" style={styles.label}>
        {label}
      </Text>
      <TextInput
        {...props}
        maxFontSizeMultiplier={theme.typography.maxFontScale}
        accessibilityLabel={error ? `${accessibilityLabel ?? label}. ${error}` : accessibilityLabel ?? label}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={theme.color.textTertiary}
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError, style]}
      />
      {error ? (
        <Text variant="caption" style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    field: {
      gap: 6,
      marginBottom: t.space[3],
    },
    label: {
      fontFamily: t.typography.family.uiMedium,
      fontSize: 13,
      color: t.color.textSecondary,
    },
    input: {
      minHeight: t.sizing.ctrlMd,
      borderWidth: 1.5,
      borderColor: t.color.borderStrong,
      borderRadius: t.radius.sm,
      backgroundColor: t.color.surfaceCard,
      color: t.color.textPrimary,
      fontFamily: t.typography.family.ui,
      fontSize: 16,
      paddingHorizontal: 14,
    },
    inputFocused: {
      borderColor: t.color.action,
    },
    inputError: {
      borderColor: t.status.overdue.solid,
    },
    error: {
      color: t.status.overdue.text,
      fontSize: 12,
    },
  });
