import * as React from "react";
import { useColorScheme as useSystemScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { makeTokens, type ColorScheme, type Tokens } from "./tokens";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContext = {
  scheme: ColorScheme;
  preference: ThemePreference;
  tokens: Tokens;
  setPreference: (next: ThemePreference) => void;
};

const STORAGE_KEY = "aether.theme.preference";

const Ctx = React.createContext<ThemeContext | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemScheme();
  const [preference, setPreferenceState] = React.useState<ThemePreference>("system");

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === "light" || value === "dark" || value === "system") {
          setPreferenceState(value);
        }
      })
      .catch(() => {});
  }, []);

  const setPreference = React.useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: ColorScheme =
    preference === "system" ? (system === "dark" ? "dark" : "light") : preference;

  const tokens = React.useMemo(() => makeTokens(scheme), [scheme]);

  const value = React.useMemo<ThemeContext>(
    () => ({ scheme, preference, tokens, setPreference }),
    [scheme, preference, tokens, setPreference],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeContext {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
