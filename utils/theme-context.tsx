import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem("theme");
        if (stored === "light" || stored === "dark") {
          setTheme(stored);
        } else if (systemColorScheme) {
          setTheme(systemColorScheme);
        }
      } catch (e) {
        setTheme(systemColorScheme || "light");
      }
    }
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  const setThemeDirect = (newTheme: Theme) => {
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeDirect }}>
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
