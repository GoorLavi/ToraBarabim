import type { VisitorMessageType } from '@torabarabim/common';

import type { VisitorMessageDraft } from '../../models';
import type { HelpWindowCopy } from './models';

// The window's title is the opening tile's own (VISITOR_MESSAGE_TITLES in
// HomePage/components/consts.ts), so only what follows it is written here.
export const HELP_WINDOW_COPY: Record<VisitorMessageType, HelpWindowCopy> = {
  'rabbi-request': {
    paragraphs: [
      'על הרבה שיעורי תורה שומעים רק מפה לאוזן. עזרו לנו להביא אותם לקהל הרחב.',
      'כתבו לנו כמה מילים על הרב או הרבנית, ואיך אפשר ליצור קשר איתם או עם הגבאי.',
    ],
    messagePlaceholder: 'שם הרב או הרבנית, איפה מתקיימים השיעורים ואיך אפשר ליצור קשר איתם או עם הגבאי',
  },
  volunteer: {
    paragraphs: [
      'מאחורי כל שיעור מעודכן באתר עומד מישהו שדאג לכך. עזרו לנו לפתוח דלת לעוד לומדים.',
      'ההתנדבות היא להוסיף לאתר רבנים ורבניות ולדאוג שהשיעורים שלהם יהיו מעודכנים. אפשר מהבית, בזמן שנוח לכם. רוצים להצטרף? השאירו פרטים וכמה מילים עליכם.',
    ],
    messagePlaceholder: 'כמה מילים עליכם',
  },
};

export const THANK_YOU_MESSAGE = 'תודה רבה, ההודעה התקבלה.';
export const CLOSE_LABEL = 'סגירה';

// The pinned close button's size, and the band it needs clear of other
// content: its 48px plus the `md` inset above and below it. The header pads
// its inline end by it, and the form's fields scroll clear of it, so it is
// written once here and read in both styles files.
export const CLOSE_BUTTON_SIZE_PX = 48;
export const closeButtonClearance = (mdSpacing: string): string => `calc(${CLOSE_BUTTON_SIZE_PX}px + 2 * ${mdSpacing})`;

// Kept here, with the window, rather than in HomeRails/consts.ts: that file
// is imported by a server test (dedication-band.test.ts) for the band slot,
// and HomeRails/models.ts reaches the browser-only HomePage/api.ts, which
// does not compile under the server's test tsconfig.
export const EMPTY_VISITOR_MESSAGE_DRAFT: VisitorMessageDraft = { name: '', phone: '', message: '' };

export const EMPTY_VISITOR_MESSAGE_DRAFTS: Record<VisitorMessageType, VisitorMessageDraft> = {
  'rabbi-request': EMPTY_VISITOR_MESSAGE_DRAFT,
  volunteer: EMPTY_VISITOR_MESSAGE_DRAFT,
};
