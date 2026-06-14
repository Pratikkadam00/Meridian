import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { tokens, type MeridianTokens } from "./tokens";

type ThemeContextValue = {
  tokens: MeridianTokens;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const value = useMemo<ThemeContextValue>(() => ({ tokens }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return value;
}
