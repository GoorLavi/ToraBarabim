import { useEffect, useState } from 'react';

import { DEFAULT_THEME_NAME, THEME_NAMES, THEME_STORAGE_KEY } from './consts';
import type { ThemeName } from './models';

const readStoredThemeName = (): ThemeName => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return (THEME_NAMES as string[]).includes(stored ?? '') ? (stored as ThemeName) : DEFAULT_THEME_NAME;
};

// Backs the dev theme switcher. Persists the choice in localStorage so
// comparing the three themes survives a reload.
export const useThemeSelection = (): [ThemeName, (name: ThemeName) => void] => {
  const [themeName, setThemeName] = useState<ThemeName>(readStoredThemeName);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, [themeName]);

  return [themeName, setThemeName];
};
