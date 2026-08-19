import type { Area, RabbiProminence } from '@torabarabim/common';

// Today through today + HOME_WINDOW_DAYS, inclusive.
export const HOME_WINDOW_DAYS = 14;

export const MAX_ITEMS_PER_ROW = 12;
export const MIN_ITEMS_PER_ROW = 3;

export const AREA_NAMES_HE: Record<Area, string> = {
  north: 'הצפון',
  haifa: 'חיפה והקריות',
  sharon: 'השרון',
  center: 'המרכז',
  telAviv: 'תל אביב',
  jerusalem: 'ירושלים',
  shfela: 'השפלה',
  south: 'הדרום',
};

// Lower rank sorts first: sought, then known, then local.
export const PROMINENCE_RANK: Record<RabbiProminence, number> = {
  sought: 0,
  known: 1,
  local: 2,
};
