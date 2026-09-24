import type { AdminDedicationState, DedicationHonorific, DedicationPreviewRequest, DedicationType, HonoredGender, RabbiProminence, Weekday } from '@torabarabim/common';

import type { AdminDedicationFilters, AdminLessonFilters, AdminPlaceFilters, AdminRabbiFilters, AdminUserFilters } from './models';

// Mirrors `server/src/service/admin-shared/consts.ts`'s `MAX_ADMIN_PAGE_SIZE`.
// Used as the page size for "fetch the whole list once and join in memory"
// reads (root CLAUDE.md, Async and data access), not for user-facing paging.
export const MAX_ADMIN_PAGE_SIZE = 50;

// Mirrors the server's `MIN_PASSWORD_LENGTH` (server/src/service/admin-auth/consts.ts).
// The common ancestor of AdminFormPage's create-admin form and AdminCard's
// set-password dialog, both of which validate a password against it (root
// CLAUDE.md, Scope and Boundaries: a threshold lives in one place).
export const MIN_PASSWORD_LENGTH = 6;
export const PASSWORD_TOO_SHORT_ERROR = `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`;
export const PASSWORD_MISMATCH_ERROR = 'הסיסמאות אינן תואמות';

// Shared by every panel form with a photo upload (the rabbi's poster, a
// place's own photo): the client-side type/size check is identical no
// matter which entity the photo belongs to, so the threshold and its two
// messages live here once `PlaceFormPage` became a second caller.
// Kept identical to `~/components/PhotoPicker/consts.ts`'s own pair: the
// same rejection reaches the person from either this form's validation or
// the picker's, and it must not read two ways depending on which caught it
// first.
export const CLIENT_MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const UNSUPPORTED_TYPE_CLIENT_ERROR = 'אפשר להעלות קובץ JPG או PNG בלבד';
export const TOO_LARGE_CLIENT_ERROR = 'התמונה גדולה מ-5MB';

// `~/components/PhotoPicker/consts.ts` holds the one client-side copy of
// the server's `invalid_photo` rejection (server/src/api/admin/places/index.ts):
// shown as-is rather than the generic 400 copy below, since it already names
// the floor the photo failed, and the admin place and rabbi forms have no
// client-side dimension check of their own to explain the rejection
// otherwise.
export { INVALID_PHOTO_MESSAGE } from '~/components/PhotoPicker/consts';

export const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה, נסה שוב מאוחר יותר';
export const NETWORK_ERROR_MESSAGE = 'לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב';
export const UNAUTHENTICATED_MESSAGE = 'תוקף ההתחברות פג. יש להתחבר מחדש';
export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NOT_FOUND_MESSAGE = 'הרשומה המבוקשת לא נמצאה';
// The exact wording for the login rate limiter was not captured from the
// design, so this is written fresh (see the report for this slice).
export const RATE_LIMITED_MESSAGE = 'יותר מדי ניסיונות כניסה. נסה שוב בעוד כמה דקות';

// `Record`, not an array, so indexing by `Weekday` needs no bounds check:
// every `Weekday` (0-6) has an entry by construction. Read by
// `recurrenceWhenLabel`/`weeklyRecurrenceLabel` below, shared by
// `LessonsListPage` and `RabbiViewPage`'s inline lesson rows, and by
// `LessonFormPage`'s live preview and `LessonViewPage`'s "when" fields.
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'יום ראשון',
  1: 'יום שני',
  2: 'יום שלישי',
  3: 'יום רביעי',
  4: 'יום חמישי',
  5: 'יום שישי',
  6: 'שבת',
};

// Bare weekday names, without the repeated 'יום', for joining several
// weekdays into one line (see `weeklyRecurrenceLabel` in `helpers.ts`).
export const WEEKDAY_BARE_LABELS: Record<Weekday, string> = {
  0: 'ראשון',
  1: 'שני',
  2: 'שלישי',
  3: 'רביעי',
  4: 'חמישי',
  5: 'שישי',
  6: 'שבת',
};

export const UNTITLED_RABBI_FALLBACK = 'רב לא ידוע';

// The one construction site for a new-lesson link preselecting its rabbi
// (`usePreselectedRabbi` is the one reader). Named here because four
// separate call sites used to hand-build this query string.
export const PRESELECTED_RABBI_PARAM = 'rabbiId';

// The row shape both `LessonViewPage` and `RabbiViewPage` skeletons need: a
// fixed field count per render, never reordered or spliced, so no
// placeholder can change position under a mounted node.
export const skeletonFieldKeys = (fieldCount: number): string[] =>
  Array.from({ length: fieldCount }, (_, index) => `skeleton-field-${index}`);

// The one place that says "opens the record's own screen, not its edit
// form" on a list row. Was 'עריכה' before the view-first redesign; renamed
// once both `LessonsListPage` and `RabbisListPage` needed it, so it stops
// being a promise the click no longer keeps.
export const DETAILS_LABEL = 'פרטים';

// Admin-only: drives the home page's rail order and is never shown to a
// visitor (design-system.md has no public surface for it). Read by
// `RabbiFormPage` (as an editable option list) and `RabbiViewPage` (as a
// read-only value), the nearest ancestor both share.
export const PROMINENCE_LABELS: Record<RabbiProminence, string> = {
  local: 'אזורי',
  known: 'מוכר',
  sought: 'מבוקש',
};

export const ADMIN_QUERY_KEYS = {
  session: () => ['admin', 'session'] as const,
  rabbis: (filters: AdminRabbiFilters) => ['admin', 'rabbis', 'search', filters] as const,
  rabbi: (id: string) => ['admin', 'rabbis', id] as const,
  rabbiDeletePreview: (id: string) => ['admin', 'rabbis', id, 'delete-preview'] as const,
  rabbiAccount: (id: string) => ['admin', 'rabbis', id, 'account'] as const,
  lessons: (filters: AdminLessonFilters) => ['admin', 'lessons', 'search', filters] as const,
  lesson: (id: string) => ['admin', 'lessons', id] as const,
  lessonOccurrences: (lessonId: string) => ['admin', 'lessons', lessonId, 'occurrences'] as const,
  lessonExceptions: (lessonId: string) => ['admin', 'lessons', lessonId, 'exceptions'] as const,
  adminUsers: (filters: AdminUserFilters) => ['admin', 'admin-users', 'search', filters] as const,
  places: (filters: AdminPlaceFilters) => ['admin', 'places', 'search', filters] as const,
  place: (id: string) => ['admin', 'places', id] as const,
  placeAccount: (id: string) => ['admin', 'places', id, 'account'] as const,
  dedications: (filters: AdminDedicationFilters) => ['admin', 'dedications', 'search', filters] as const,
  dedicationsAll: () => ['admin', 'dedications'] as const,
  dedication: (id: string) => ['admin', 'dedications', id] as const,
  // `fields` is the live draft, debounced (DedicationFormPage/useDedicationPreview.ts):
  // a distinct set of field values is its own cache entry, so a response can
  // never land against a key a later keystroke has already moved past.
  dedicationPreview: (fields: DedicationPreviewRequest) => ['admin', 'dedications', 'preview', fields] as const,
};

export const ADMIN_ROUTES = {
  login: '/admin/login',
  lessons: '/admin/lessons',
  lessonNew: '/admin/lessons/new',
  lessonView: (id: string) => `/admin/lessons/${id}`,
  lessonEdit: (id: string) => `/admin/lessons/${id}/edit`,
  rabbis: '/admin/rabbis',
  rabbiNew: '/admin/rabbis/new',
  rabbiView: (id: string) => `/admin/rabbis/${id}`,
  rabbiEdit: (id: string) => `/admin/rabbis/${id}/edit`,
  places: '/admin/places',
  placeNew: '/admin/places/new',
  placeView: (id: string) => `/admin/places/${id}`,
  placeEdit: (id: string) => `/admin/places/${id}/edit`,
  admins: '/admin/admins',
  adminNew: '/admin/admins/new',
  dedications: '/admin/dedications',
  dedicationNew: '/admin/dedications/new',
  dedicationView: (id: string) => `/admin/dedications/${id}`,
  dedicationEdit: (id: string) => `/admin/dedications/${id}/edit`,
};

// Hand-mirrored from `DedicationType` (`common/src/dedication.ts`): that
// package is types only, so nothing runtime can be imported from it (see
// `PROMINENCE_OPTIONS` above for the same trap with `RabbiProminence`). The
// `Record` return type is exhaustive: a fourth type fails this file to build
// until it is given a Hebrew label.
export const DEDICATION_TYPE_LABELS: Record<DedicationType, string> = {
  memorial: 'לעילוי נשמה',
  healing: 'לרפואה שלמה',
  success: 'להצלחה',
};
export const DEDICATION_TYPE_OPTIONS: readonly DedicationType[] = Object.keys(DEDICATION_TYPE_LABELS) as DedicationType[];

// Hand-mirrored from `DedicationHonorific`, same reason as above.
export const DEDICATION_HONORIFIC_LABELS: Record<DedicationHonorific, string> = {
  zl: 'ז״ל',
  ah: 'ע״ה',
  hyd: 'הי״ד',
};
export const DEDICATION_HONORIFIC_OPTIONS: readonly DedicationHonorific[] = Object.keys(DEDICATION_HONORIFIC_LABELS) as DedicationHonorific[];
// The honorific is optional on the record (common/src/dedication.ts): this
// is not itself a `DedicationHonorific` value, only this picker's label for
// choosing none.
export const NO_HONORIFIC_LABEL = 'ללא תוספת';

// Hand-mirrored from `HonoredGender`, same reason as above.
export const HONORED_GENDER_LABELS: Record<HonoredGender, string> = {
  male: 'בן',
  female: 'בת',
};
export const HONORED_GENDER_OPTIONS: readonly HonoredGender[] = Object.keys(HONORED_GENDER_LABELS) as HonoredGender[];

// Mirrors the comment on `AdminDedicationState` (`common/src/admin.ts`).
export const DEDICATION_STATE_LABELS: Record<AdminDedicationState, string> = {
  upcoming: 'טרם התחילה',
  live: 'מוצגת באתר',
  ended: 'הסתיימה',
  takenDown: 'הוסרה',
};

// The parent-name label depends on the dedication's own type, and is the
// only thing telling the admin which parent's name the custom asks for: a
// memorial is named by the father, a healing prayer by the mother, and a
// success dedication by either. Lifted here rather than colocated with the
// form, because `DedicationViewPage` has to read the same label the field
// was filled under.
export const DEDICATION_PARENT_NAME_LABELS: Record<DedicationType, string> = {
  memorial: 'שם האב',
  healing: 'שם האם',
  success: 'שם האב או האם',
};

export const lessonNewForRabbi = (rabbiId: string): string => `${ADMIN_ROUTES.lessonNew}?${PRESELECTED_RABBI_PARAM}=${rabbiId}`;
