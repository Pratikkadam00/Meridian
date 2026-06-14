import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { tokens } from "@/shared/theme/tokens";
import { Text } from "./Text";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.field}>
      <Text variant="caption" muted style={styles.label}>
        {label}
      </Text>
      <TextInput
        {...props}
        placeholderTextColor={tokens.colors.placeholder}
        style={[styles.input, error && styles.inputError, style]}
      />
      {error ? (
        <Text variant="caption" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 7,
    marginBottom: tokens.spacing[12],
  },
  label: {
    fontSize: 12,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.field,
    backgroundColor: tokens.colors.panel,
    color: tokens.colors.ink,
    fontFamily: tokens.font.bodyRegular,
    fontSize: 15,
    paddingHorizontal: tokens.spacing[16],
  },
  inputError: {
    borderColor: tokens.colors.over,
  },
  error: {
    color: tokens.colors.over,
  },
});
