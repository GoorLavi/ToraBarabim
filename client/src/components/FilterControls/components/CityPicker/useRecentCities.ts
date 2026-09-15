import { useState } from 'react';

import type { SelectedCity } from '~/hooks/models';

import { MAX_RECENT_CITIES, RECENT_CITIES_STORAGE_KEY } from './consts';

const isSelectedCity = (value: unknown): value is SelectedCity =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as SelectedCity).id === 'string' &&
  typeof (value as SelectedCity).name === 'string';

// localStorage can throw (private browsing, a blocked site data setting)
// and does not exist during server rendering. Fail open: on any failure this
// drops the recent block and leaves the rest of the picker working, since
// "recently chosen" is a convenience the picker does not depend on to
// function, not a value worth risking the whole component over.
const readRecentCities = (): SelectedCity[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_CITIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSelectedCity) : [];
  } catch {
    return [];
  }
};

const writeRecentCities = (cities: SelectedCity[]): void => {
  try {
    window.localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(cities));
  } catch {
    // Fail open: see readRecentCities above.
  }
};

export interface RecentCitiesState {
  recentCities: SelectedCity[];
  addRecentCity: (city: SelectedCity) => void;
}

export const useRecentCities = (): RecentCitiesState => {
  const [recentCities, setRecentCities] = useState<SelectedCity[]>(() =>
    typeof window === 'undefined' ? [] : readRecentCities(),
  );

  const addRecentCity = (city: SelectedCity): void => {
    setRecentCities((previous) => {
      const next = [city, ...previous.filter((entry) => entry.id !== city.id)].slice(0, MAX_RECENT_CITIES);
      writeRecentCities(next);
      return next;
    });
  };

  return { recentCities, addRecentCity };
};
