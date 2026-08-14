import type { DateFilterOption } from '~/HomePage/models';

export const GROUP_LABEL = 'סינון לפי תאריך';
export const CUSTOM_DATE_LABEL = 'בחירת תאריך אחר';

export const DATE_FILTER_OPTIONS: { value: Exclude<DateFilterOption, 'custom'>; label: string }[] = [
  { value: 'today', label: 'היום' },
  { value: 'tomorrow', label: 'מחר' },
  { value: 'shabbat', label: 'בשבת' },
];
