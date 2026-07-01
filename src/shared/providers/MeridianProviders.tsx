import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth";
import { RepositoryProvider } from "@/shared/data/RepositoryProvider";
import { FeatureFlagProvider } from "@/shared/featureFlags/FeatureFlagProvider";
import { I18nProvider } from "@/shared/lib/i18n/I18nProvider";
import { SecurityProvider } from "@/shared/security/SecurityProvider";
import { ThemeProvider, useTheme } from "@/shared/theme/ThemeProvider";
import { warmCriticalImageCache } from "@/shared/ui/imageCache";

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.name === "dark" ? "light" : "dark"} />;
}

// Root view + native window chrome that track the active theme. Sits inside
// ThemeProvider so it can read useTheme(): it paints the canvas behind every
// screen (visible during navigation transitions / overscroll) and keeps the
// Android system background in sync with Light/Dark/System instead of leaving
// a light slab behind the jade-ink dark UI.
function ThemedRoot({ children }: PropsWithChildren) {
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS !== "web") {
      void SystemUI.setBackgroundColorAsync(theme.color.bgApp);
    }
  }, [theme]);

  return <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.bgApp }}>{children}</GestureHandlerRootView>;
}

export function MeridianProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    warmCriticalImageCache();
  }, []);

  return (
    <ThemeProvider>
      <ThemedRoot>
        <SafeAreaProvider>
          <I18nProvider>
            <SecurityProvider>
              <FeatureFlagProvider>
                <RepositoryProvider>
                  <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                      <ThemedStatusBar />
                      {children}
                    </QueryClientProvider>
                  </AuthProvider>
                </RepositoryProvider>
              </FeatureFlagProvider>
            </SecurityProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </ThemedRoot>
    </ThemeProvider>
  );
}
