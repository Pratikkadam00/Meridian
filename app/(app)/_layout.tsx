import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StyleSheet, View } from "react-native";

import { FloatingNav } from "@/features/navigation";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";

export default function AppLayout() {
  const { theme } = useTheme();
  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.bgApp } }} />
      <FloatingNav />
    </View>
  );
}

// Route-group boundary: a crash inside a single (app) screen renders the
// fallback in place of that screen instead of tearing down the whole app shell.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} onRetry={retry} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
