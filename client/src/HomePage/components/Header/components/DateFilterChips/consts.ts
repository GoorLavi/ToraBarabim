import type { DateFilterOption } from '~/HomePage/models';

export const GROUP_LABEL = 'סינון לפי תאריך';
export const CUSTOM_DATE_LABEL = 'בחירת תאריך אחר';

export const DATE_FILTER_OPTIONS: { value: Exclude<DateFilterOption, 'custom' | 'all'>; label: string }[] = [
  { value: 'today', label: 'היום' },
  { value: 'tomorrow', label: 'מחר' },
  { value: 'shabbat', label: 'בשבת' },
];

// The selected chip's own accessible name names the action a second tap
// takes, since the × glyph is the entire affordance: no hint text, no
// tooltip.
export const clearFilterLabel = (label: string): string => `${label}, הסרת הסינון`;
