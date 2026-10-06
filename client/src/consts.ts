import type { LessonAudience, LessonTopic, RabbiHonorific } from '@torabarabim/common';

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

// A course's own state tag, read by the public card, the course page, and
// every panel row or record that shows one (the coordinator's word choices,
// 2026-09-25). "Registration open" covers both `notOpen` and `open`: a
// reader deciding whether to press "for registration" does not need the
// distinction a panel row does.
export const COURSE_STATE_TAG_OPEN = 'ההרשמה פתוחה';
export const COURSE_STATE_TAG_FULL = 'תפוסה מלאה';
export const COURSE_STATE_TAG_CLOSED = 'ההרשמה נסגרה';

// A closed or full course's own record explanation, read by both panels'
// read-only records (the rabbi's `ReadOnlyCourseRecord` and the admin's
// `CourseViewPage`), so the one sentence cannot drift into two.
export const COURSE_CLOSED_RECORD_EXPLANATION = 'הקורס נשאר כמו שהיה. כדי לפתוח ממנו מחזור חדש, משכפלים אותו לתאריך חדש.';

// The five course lifecycle actions, worded identically wherever a course
// record offers them: the rabbi's own edit form (as buttons) and the
// admin's record page and the rabbi's own read-only record (as links or
// buttons). Each opens its own confirm sheet or navigates, so these are
// trigger labels, distinct from a sheet's own confirm-button wording.
export const COURSE_VIEW_ON_SITE_ACTION_LABEL = 'לעמוד הקורס באתר';
export const COURSE_MARK_FULL_ACTION_LABEL = 'סימון תפוסה מלאה';
export const COURSE_CLOSE_REGISTRATION_ACTION_LABEL = 'סגירת ההרשמה';
export const COURSE_DUPLICATE_ACTION_LABEL = 'שכפול לתאריך חדש';
export const COURSE_DELETE_ACTION_LABEL = 'מחיקת הקורס';

// A course's fact labels, nouns throughout rather than "איפה"/"למי", so the
// five read as one grammatical kind (spec section 13, editor). Lifted from
// `CoursePage/consts.ts` once the rabbi panel's own read-only course record
// became a second caller.
export const COURSE_FACT_OPENING_LABEL = 'פתיחה';
export const COURSE_FACT_SCOPE_LABEL = 'היקף';
export const COURSE_FACT_VENUE_LABEL = 'מקום';
export const COURSE_FACT_AUDIENCE_LABEL = 'קהל';
export const COURSE_FACT_PRICE_LABEL = 'מחיר';

export const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);
export const cityCountLabel = (count: number): string => (count === 1 ? 'עיר אחת' : `${count} ערים`);

// Read by AreaLink (the city page's own title block and CityEmptyState) and
// by the lesson page's area rail, whose heading link (RailHeading) renders the
// label directly without AreaLink since that line needs heading semantics, not
// a Secondary link.
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

// The lesson topic vocabulary. Read by the lesson card, the lesson row, the
// lesson ticket, the place panel's lesson form, and the course page (a
// course's own topic is the same `LessonTopic` list, plus `אחר` with its
// own free text). Lifted here once the course page became a fourth reach
// into `HomePage/components/LessonCard/consts.ts` for it.
export const LESSON_TOPIC_LABELS: Record<LessonTopic, string> = {
  gemara: 'גמרא',
  halacha: 'הלכה',
  parasha: 'פרשת השבוע',
  mussar: 'מוסר',
  chassidut: 'חסידות',
  tanach: 'תנ״ך',
  machshava: 'מחשבה',
  other: 'כללי',
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

// Hand-mirrored by name from server/src/service/course/consts.ts: a course
// photo of any size is accepted (the owner's call, "לקבל כל גודל, עם אזהרה
// על טשטוש"), so nothing here rejects an upload any more. These are the
// soft thresholds the picker warns below instead, after the upload
// succeeds, sized to the cover's own card render and the gallery rail's
// widest tier.
export const COURSE_COVER_SOFT_MIN_WIDTH = 600;
export const COURSE_COVER_SOFT_MIN_HEIGHT = 800;
export const COURSE_GALLERY_SOFT_MIN_SIDE = 600;

// Shown under the cover field, not as a rejection, once the cover has
// uploaded (or, on the create form, been picked) and its pixel dimensions
// read below the soft floor above. The gallery reads its own count-aware
// line instead (`GalleryField/consts.ts`, `gallerySmallPhotoWarning`),
// since the one warning under its grid can name several marked tiles at
// once, which the cover, always exactly one photo, never needs to.
export const COURSE_PHOTO_SMALL_WARNING = 'התמונה קטנה, ובאתר היא עלולה להיראות מטושטשת. אם יש גרסה גדולה יותר, כדאי להעלות אותה.';

// A title's own name-and-cycle join ("יסודות האמונה · מחזור 3"): read by
// every card and row that joins the two. The space before the dot is
// non-breaking, bound to the name before it so the dot can never dangle
// alone at a line break (design review); the space after is a normal one,
// the same shape as `helpers.ts`'s own `joinWithMiddleDot`.
export const MIDDLE_DOT_SEPARATOR = ' · ';

// A meta line's own two-part join ("גברים · תל אביב", "גברים · תיאור
// קצר"): both sides non-breaking, so the dot can never dangle alone at
// either end of a line break (design review, card meta at 375). Read by
// every card whose meta line joins an audience tag to a city or a short
// description.
export const META_LINE_SEPARATOR = ' · ';

// CourseCard's own meta line (design gate round 2 finding): the audience
// phrase itself never wraps mid-sentence (styles.ts, ".audience"), so the
// space before the dot can stay a normal, breakable one, moving the whole
// "· city" tail to its own line when the row runs out of room; the space
// after the dot stays non-breaking, binding the dot to the city that
// follows it. Distinct from META_LINE_SEPARATOR above, which every other
// card keeps as is.
export const COURSE_CARD_META_SEPARATOR = ' ·\u00A0';

// The floor from design-system.md's card width step: every rail card
// (`LessonCard`, `CourseCard`) steps its own type scale at this rendered
// width, via `@container` rather than a viewport media query.
export const CARD_WIDE_THRESHOLD = '190px';

// The bare flag a shared link carries (`?s`), so a visit that started from a
// friend's message is recognisable in the page view. Short on purpose: it
// sits in front of a person in WhatsApp.
export const SHARED_LINK_FLAG = 's';
