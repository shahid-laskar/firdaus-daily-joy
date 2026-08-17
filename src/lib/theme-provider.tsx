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
  if (root.dataset["experience"] !== experience) {
    root.dataset["experience"] = experience;
  }
  if (root.dataset["theme"] !== theme) {
    root.dataset["theme"] = theme;
  }
  const isDark = mode === "dark";
  if (root.classList.contains("dark") !== isDark) {
    root.classList.toggle("dark", isDark);
  }
  if (root.style.colorScheme !== mode) {
    root.style.colorScheme = mode;
  }
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

  // Sync state when default props change
  useEffect(() => {
    setExperienceState(defaultExperience);
  }, [defaultExperience]);

  useEffect(() => {
    setThemeState(defaultTheme);
  }, [defaultTheme]);

  useEffect(() => {
    setModeState(defaultMode);
  }, [defaultMode]);

  // Client hydration check: sync any local preferences to cookies for future SSR requests
  useEffect(() => {
    try {
      const storedExp = window.localStorage.getItem(EXPERIENCE_KEY);
      if (isExperienceId(storedExp)) {
        document.cookie = `${EXPERIENCE_KEY}=${storedExp}; path=/; max-age=31536000; SameSite=Lax`;
      }
      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (isThemeId(storedTheme)) {
        document.cookie = `${THEME_KEY}=${storedTheme}; path=/; max-age=31536000; SameSite=Lax`;
      }
      const storedMode = window.localStorage.getItem(MODE_KEY)?.replace(/"/g, "");
      if (storedMode === "dark" || storedMode === "light") {
        document.cookie = `${MODE_KEY}=${storedMode}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    applyToDocument(experience, theme, mode);
  }, [experience, theme, mode]);

  const setExperience = useCallback((next: ExperienceId) => {
    if (!isExperienceId(next)) return;
    setExperienceState(next);
    applyToDocument(next, theme, mode);
    try {
      window.localStorage.setItem(EXPERIENCE_KEY, next);
      document.cookie = `${EXPERIENCE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, [theme, mode]);

  const setTheme = useCallback((next: ThemeId) => {
    if (!isThemeId(next)) return;
    setThemeState(next);
    applyToDocument(experience, next, mode);
    try {
      window.localStorage.setItem(THEME_KEY, next);
      document.cookie = `${THEME_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, [experience, mode]);

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    applyToDocument(experience, theme, next);
    try {
      window.localStorage.setItem(MODE_KEY, next);
      document.cookie = `${MODE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, [experience, theme]);

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
