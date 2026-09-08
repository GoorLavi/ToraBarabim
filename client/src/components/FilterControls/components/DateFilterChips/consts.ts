import type { DateFilterOption } from '~/hooks/models';

export const GROUP_LABEL = 'סינון לפי תאריך';
export const CUSTOM_DATE_LABEL = 'בחירת תאריך אחר';

export const DATE_FILTER_OPTIONS: { value: Exclude<DateFilterOption, 'custom' | 'all'>; label: string }[] = [
  { value: 'today', label: 'היום' },
  { value: 'tomorrow', label: 'מחר' },
  { value: 'shabbat', label: 'בשבת' },
];

// The selected chip's own accessible name names the action a second tap
// takes, since the × glyph is the entire affordance: no hint text, no
// tooltip. Still used by the three named chips only: the calendar chip now
// opens the picker on tap instead of clearing (see changeDateLabel below).
export const clearFilterLabel = (label: string): string => `${label}, הסרת הסינון`;

// Fed by dayLabel(customDate), so a screen reader hears the long weekday
// form while the chip itself shows the compact one.
export const changeDateLabel = (label: string): string => `${label}, שינוי התאריך`;

// Distinct from CUSTOM_DATE_LABEL on purpose: the chip says what a tap
// does, the dialog says what it is.
export const DIALOG_LABEL = 'בחירת תאריך';
export const CLOSE_SHEET_LABEL = 'סגירה';
