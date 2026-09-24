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

// International format, required by the `wa.me` link syntax, and the same
// number formatted the way an Israeli reader expects.
export const SITE_CONTACT_PHONE_INTERNATIONAL = '972527570636';
export const SITE_CONTACT_PHONE_DISPLAY = '052-757-0636';

// Simple Icons' WhatsApp glyph (MIT licensed), viewBox 0 0 24 24.
export const WHATSAPP_ICON_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24.032 12.045.032c-6.559 0-11.888 5.328-11.892 11.884a11.847 11.847 0 001.588 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.446h.005c6.556 0 11.887-5.328 11.892-11.884a11.85 11.85 0 00-3.422-8.461';

// WhatsApp's own brand green, not this site's, so it is not a theme token
// (0014-the-logo-is-a-fixed-mark-not-a-theme-token.md). Two separate pairs,
// not one: `PanelLogin`'s icon-only button and the dedication window's
// filled button were never the same shade, and the window's own pair is
// distinct on purpose (#17853F clears 4.5:1 with white as a filled
// background; PanelLogin's #1DA851 only ever sits under a graphics-level
// 3:1 threshold).
export const PANEL_LOGIN_WHATSAPP_COLOR = '#1DA851';
export const PANEL_LOGIN_WHATSAPP_COLOR_HOVER = '#17853F';
export const DEDICATION_WHATSAPP_COLOR = '#17853F';
export const DEDICATION_WHATSAPP_COLOR_HOVER = '#136C33';
