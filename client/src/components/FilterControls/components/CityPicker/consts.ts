export const CITY_PICKER_QUERY_KEYS = {
  search: (q: string) => ['cityPicker', 'search', q] as const,
  suggestions: () => ['cityPicker', 'suggestions'] as const,
};

// Shown on the pill when no city is chosen: a real "all areas" state
// (design-system.md, "No default city"), distinct from any chosen city's
// name.
export const ALL_AREAS_LABEL = 'כל הארץ';

// Doubles as the panel's dialog `aria-label` (CityPicker.tsx) and its own
// visible heading row (CityPickerPanel.tsx).
export const PANEL_HEADING = 'בחירת עיר';
export const CLOSE_PANEL_LABEL = 'סגירה';

// The selected pill's own accessible name names the action a second tap
// takes: no hint text, no tooltip.
export const clearCityLabel = (name: string): string => `${name}, הסרת הסינון`;

export const RECENT_CITIES_STORAGE_KEY = 'torabarabim:recentCities';
export const MAX_RECENT_CITIES = 3;
