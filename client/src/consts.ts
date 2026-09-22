import type { LessonAudience, RabbiHonorific } from '@torabarabim/common';

import { SITE_NAME, SITE_ORIGIN } from '../consts';

// Shared across the city, cities and area pages (client/src/CityPage,
// client/src/CitiesPage, client/src/AreaPage): three callers each of the
// back link and the two count labels.
export const BACK_TO_ALL_CITIES_LABEL = 'חזרה לכל הערים';

// The one Hebrew label per honorific, read by `rabbiDisplayName` (helpers.ts)
// and by every screen that lets an admin or a rabbanit's own profile show
// which one applies.
export const RABBI_HONORIFIC_LABELS: Record<RabbiHonorific, string> = {
  rav: 'הרב',
  rabbanit: 'הרבנית',
};

// The possessive prefix before the rabbi being substituted for, honorific-aware
// so it never reads as "at the place called <name>": `הרב` and `הרבנית` both
// start with the definite article, and the plain `במקום` that used to precede
// them was ambiguous between "instead of" and "at the venue of".
export const SUBSTITUTE_PREFIX_BY_HONORIFIC: Record<RabbiHonorific, string> = {
  rav: 'במקומו של',
  rabbanit: 'במקומה של',
};

export const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);
export const cityCountLabel = (count: number): string => (count === 1 ? 'עיר אחת' : `${count} ערים`);

// Read by AreaLink (the city page's own title block and CityEmptyState) and
// by AreaLessonsPreview's own heading link, which renders the label directly
// without AreaLink since that line needs heading semantics, not a Secondary
// link.
export const areaLinkLabel = (areaName: string): string => `לכל השיעורים באזור ${areaName}`;

// The fixed page size "load more" pages through (CityPage, WomenPage): one
// number, so a change to it cannot leave one of them stale. Mirrors the
// server's own MAX_PAGE_SIZE (server/src/service/shared/consts.ts), the
// largest page either page is allowed to ask for.
export const LESSON_LIST_PAGE_SIZE = 50;

// The one copy of the three audience values (design-system.md, "Audience
// wording"): `מעורב` never appears in this product, and the mixed-audience
// wording is spelled out rather than a single loaded word. Read by the
// lesson card, the lesson ticket, the admin and rabbi lesson forms, and the
// audience picker used by both.
export const AUDIENCE_LABELS: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};

// Read by `PanelLogin`, the one login door shared by a rabbi and a place
// account. Editor-approved reword of the sentence the admin login page still
// carries on its own; the two are not the same sentence (this one says
// "אפשר לנסות", the admin page's says "נסה"), so this stays a separate
// string rather than reusing the admin page's, which is untouched by this
// change.
export const RATE_LIMITED_ERROR = 'יותר מדי ניסיונות כניסה. אפשר לנסות שוב בעוד כמה דקות';
