import type { VisitorMessageSubject, VisitorMessageType } from '@torabarabim/common';

export const NAME_MAX_LENGTH = 80;
export const MESSAGE_MAX_LENGTH = 1000;
export const HANDLING_NOTE_MAX_LENGTH = 500;

// Hand-mirrored from `SITE_ORIGIN` in `client/consts.ts`: the server has no
// other source for the public origin, and the alert's link must open the
// panel from a phone.
export const SITE_ORIGIN = 'https://torahbarabim.com';

// Hand-mirrored from `ADMIN_ROUTES.messages` in
// `client/src/AdminPanel/consts.ts`.
export const ADMIN_MESSAGES_PATH = '/admin/messages';

// Hand-mirrored from `lessonPath` and `placePath` in `client/src/helpers.ts`.
// The place path omits the slug: `/places/:id` redirects to the full one.
export const lessonSubjectPath = (lessonId: string, date: string): string =>
  `/lesson/${encodeURIComponent(lessonId)}/${encodeURIComponent(date)}`;
export const placeSubjectPath = (placeId: string): string => `/places/${encodeURIComponent(placeId)}`;

export const SUBJECT_ID_MAX_LENGTH = 100;

export const VISITOR_MESSAGE_TYPE_LABELS_HE = {
  'rabbi-request': 'בקשה להוספת רב או רבנית',
  volunteer: 'התנדבות',
  'report-mistake': 'דיווח על טעות',
} as const satisfies Record<VisitorMessageType, string>;

export const SUBJECT_ALERT_LABELS_HE = {
  lesson: 'השיעור שדווח',
  place: 'המקום שדווח',
} as const satisfies Record<VisitorMessageSubject['kind'], string>;

export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NAME_MESSAGE = 'יש למלא שם';
export const PHONE_MESSAGE = 'יש למלא מספר פלאפון תקין';
export const MESSAGE_MESSAGE = 'יש לכתוב הודעה';
export const INVALID_CURSOR_MESSAGE = 'הבקשה להמשך הרשימה אינה תקינה';
export const NOTE_TOO_LONG_MESSAGE = 'ההערה ארוכה מדי';
export const EMPTY_UPDATE_MESSAGE = 'לא נשלח שום שינוי לעדכון';
