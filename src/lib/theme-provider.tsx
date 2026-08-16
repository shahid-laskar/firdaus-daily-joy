import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_THEME, isThemeId, type ColorMode, type ThemeId } from "./themes";
import {
  DEFAULT_EXPERIENCE,
  isExperienceId,
  type ExperienceId,
} from "./experiences";

const EXPERIENCE_KEY = "veedu.experience";
const THEME_KEY = "veedu.theme";
const MODE_KEY = "theme"; // same key the existing day/night toggle already uses

type ThemeContextValue = {
  experience: ExperienceId;
  theme: ThemeId;
  mode: ColorMode;
  setExperience: (experience: ExperienceId) => void;
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyToDocument(experience: ExperienceId, theme: ThemeId, mode: ColorMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset["experience"] = experience;
  root.dataset["theme"] = theme;
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
}

export function ThemeProvider({
  children,
  defaultExperience = DEFAULT_EXPERIENCE,
  defaultTheme = DEFAULT_THEME,
  defaultMode = "light",
}: {
  children: ReactNode;
  defaultExperience?: ExperienceId;
  defaultTheme?: ThemeId;
  defaultMode?: ColorMode;
}) {
  const [experience, setExperienceState] = useState<ExperienceId>(defaultExperience);
  const [theme, setThemeState] = useState<ThemeId>(defaultTheme);
  const [mode, setModeState] = useState<ColorMode>(defaultMode);

  // Hydrate from storage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const storedExp = window.localStorage.getItem(EXPERIENCE_KEY);
      if (isExperienceId(storedExp)) setExperienceState(storedExp);
      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (isThemeId(storedTheme)) setThemeState(storedTheme);
      const storedMode = window.localStorage.getItem(MODE_KEY)?.replace(/"/g, "");
      if (storedMode === "dark" || storedMode === "light") setModeState(storedMode);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    applyToDocument(experience, theme, mode);
  }, [experience, theme, mode]);

  const setExperience = useCallback((next: ExperienceId) => {
    setExperienceState(next);
    try {
      window.localStorage.setItem(EXPERIENCE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      experience,
      theme,
      mode,
      setExperience,
      setTheme,
      setMode,
      toggleMode: () => setMode(mode === "dark" ? "light" : "dark"),
    }),
    [experience, theme, mode, setExperience, setTheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export function useExperience() {
  const { experience, setExperience } = useTheme();
  return { experience, setExperience };
}
