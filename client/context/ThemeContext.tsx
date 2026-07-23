import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, ColorPalette } from "@/constants/Colors";

type ThemeMode = "light" | "dark" | "system";
type StatusBarOverride = { style: "light" | "dark"; backgroundColor?: string } | null;

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  // برای صفحاتی مثل ImageViewerModal که پس‌زمینه‌ی خاص خودشون رو دارن
  setStatusBarOverride: (override: StatusBarOverride) => void;
}

const STORAGE_KEY = "app_theme_mode_v1";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);
  const [override, setOverride] = useState<StatusBarOverride>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      } catch (err) {
        console.error("ThemeProvider load error:", err);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((err) =>
      console.error("ThemeProvider save error:", err)
    );
  };

  const toggleTheme = () => {
    const currentlyDark = mode === "dark" || (mode === "system" && systemScheme === "dark");
    setMode(currentlyDark ? "light" : "dark");
  };

  const isDark = mode === "dark" || (mode === "system" && systemScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, isDark, colors, setMode, toggleTheme, setStatusBarOverride: setOverride }),
    [mode, isDark, colors]
  );

  if (!hydrated) return null;

  // اگه صفحه‌ای override خواسته، همون اعمال می‌شه؛ وگرنه بر اساس تم گلوبال
  const activeStyle = override?.style ?? (isDark ? "light" : "dark");
  const activeBg = override?.backgroundColor ?? colors.surface;

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={activeStyle} backgroundColor={activeBg} translucent={false} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme باید داخل ThemeProvider استفاده بشه");
  return ctx;
}