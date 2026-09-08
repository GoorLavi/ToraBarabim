import type { Area } from '@torabarabim/common';

// Pagination defaults shared by every public list endpoint (lessons, rabbis).
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// Hebrew label for each area, shared by anything that surfaces an area to a
// reader: the home rail's row title and the city directory's group heading.
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
