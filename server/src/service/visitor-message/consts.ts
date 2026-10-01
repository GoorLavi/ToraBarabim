import type { VisitorMessageType } from '@torabarabim/common';

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

export const VISITOR_MESSAGE_TYPE_LABELS_HE = {
  'rabbi-request': 'בקשה להוספת רב או רבנית',
  volunteer: 'התנדבות',
} as const satisfies Record<VisitorMessageType, string>;
