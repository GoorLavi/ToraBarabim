import type { HelpRequestType } from '@torabarabim/common';

import { EMPTY_VISITOR_MESSAGE_DRAFT } from '~/components/HelpWindow/consts';
import type { VisitorMessageDraft } from '~/components/HelpWindow/models';

import type { HelpTileWindowCopy } from './models';

// A message tile and the window it opens carry the same title word for
// word, so it is written once here for both to read.
export const VISITOR_MESSAGE_TITLES: Record<HelpRequestType, string> = {
  'rabbi-request': 'מכירים רב או רבנית שעוד לא מופיעים באתר?',
  volunteer: 'שותפים בזיכוי הרבים',
};

// What follows the title in the window a tile opens; the title itself is the
// tile's own, above.
export const HELP_TILE_WINDOW_COPY: Record<HelpRequestType, HelpTileWindowCopy> = {
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

export const EMPTY_HELP_REQUEST_DRAFTS: Record<HelpRequestType, VisitorMessageDraft> = {
  'rabbi-request': EMPTY_VISITOR_MESSAGE_DRAFT,
  volunteer: EMPTY_VISITOR_MESSAGE_DRAFT,
};
