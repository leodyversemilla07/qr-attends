import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNWColorScheme } from "nativewind";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const { setColorScheme } = useNWColorScheme();
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem("theme");
        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
          setColorScheme(stored);
        } else if (systemColorScheme) {
          setThemeState(systemColorScheme);
          setColorScheme(systemColorScheme);
        }
      } catch {
        const fallback = systemColorScheme || "light";
        setThemeState(fallback);
        setColorScheme(fallback);
      }
    }
    loadTheme();
  }, [systemColorScheme, setColorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    setColorScheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  const setThemeDirect = (newTheme: Theme) => {
    setThemeState(newTheme);
    setColorScheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme: setThemeDirect }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
