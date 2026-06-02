"use client";

import { useEffect, useState } from "react";
import { defaultThemeId, themeOptions, type ThemeId } from "./themes";

const THEME_STORAGE_KEY = "dotted-days-theme";
const themeIds = new Set(themeOptions.map((theme) => theme.id));

export type ThemeState = {
  themeId: ThemeId;
  setTheme(themeId: ThemeId): void;
};

export function useTheme(): ThemeState {
  const [themeId, setThemeId] = useState<ThemeId>(getStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  const setTheme = (nextThemeId: ThemeId) => {
    setThemeId(nextThemeId);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextThemeId);
  };

  return {
    themeId,
    setTheme,
  };
}

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") {
    return defaultThemeId;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isThemeId(storedTheme) ? storedTheme : defaultThemeId;
}

function isThemeId(value: string | null): value is ThemeId {
  return Boolean(value && themeIds.has(value as ThemeId));
}
