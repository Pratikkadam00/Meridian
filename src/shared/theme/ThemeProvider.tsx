import * as SecureStore from "expo-secure-store";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform, useColorScheme } from "react-native";

import { darkTheme, lightTheme, type MeridianTheme } from "./meridian";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "meridian.theme.preference.v1";

type ThemeContextValue = {
  /** The resolved, active theme (jade/amber light or dark). */
  theme: MeridianTheme;
  /** The user's stored choice (may be "system"). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** True once the persisted preference has been read from storage. Boot can
   * gate first paint on this to avoid a flash of the wrong theme. */
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

async function readPreference(): Promise<ThemePreference> {
  if (Platform.OS === "web") {
    return "system";
  }
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
}

function persistPreference(preference: ThemePreference) {
  if (Platform.OS === "web") {
    return;
  }
  void SecureStore.setItemAsync(STORAGE_KEY, preference).catch(() => undefined);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void readPreference().then((stored) => {
      if (active) {
        setPreferenceState(stored);
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    persistPreference(next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;
    return {
      theme: resolved === "dark" ? darkTheme : lightTheme,
      preference,
      setPreference,
      hydrated,
    };
  }, [preference, systemScheme, setPreference, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);

  // Fall back to the light theme rather than throwing, so a themed component
  // rendered outside the provider (e.g. a root-level error fallback) is safe.
  if (!value) {
    return { theme: lightTheme, preference: "system", setPreference: () => undefined, hydrated: true };
  }

  return value;
}

/**
 * Build memoized themed styles. Pass a MODULE-LEVEL factory so its identity is
 * stable; styles recompute only when the active theme changes.
 *
 *   const makeStyles = (t: MeridianTheme) => StyleSheet.create({ ... });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T>(factory: (theme: MeridianTheme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
