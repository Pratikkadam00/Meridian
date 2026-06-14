import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth";
import { RepositoryProvider } from "@/shared/data/RepositoryProvider";
import { FeatureFlagProvider } from "@/shared/featureFlags/FeatureFlagProvider";
import { I18nProvider } from "@/shared/lib/i18n/I18nProvider";
import { SecurityProvider } from "@/shared/security/SecurityProvider";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import { tokens } from "@/shared/theme/tokens";
import { warmCriticalImageCache } from "@/shared/ui/imageCache";

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: tokens.colors.bg }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <SecurityProvider>
              <FeatureFlagProvider>
                <RepositoryProvider>
                  <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                      <StatusBar style="light" />
                      {children}
                    </QueryClientProvider>
                  </AuthProvider>
                </RepositoryProvider>
              </FeatureFlagProvider>
            </SecurityProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
