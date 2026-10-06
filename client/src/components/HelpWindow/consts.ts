import type { VisitorMessageDraft } from './models';

export const THANK_YOU_MESSAGE = 'תודה רבה, ההודעה התקבלה.';
export const CLOSE_LABEL = 'סגירה';

// The pinned close button's size, and the band it needs clear of other
// content: its 48px plus the `md` inset above and below it. The header pads
// its inline end by it, and the form's fields scroll clear of it, so it is
// written once here and read in both styles files.
export const CLOSE_BUTTON_SIZE_PX = 48;
export const closeButtonClearance = (mdSpacing: string): string => `calc(${CLOSE_BUTTON_SIZE_PX}px + 2 * ${mdSpacing})`;

export const EMPTY_VISITOR_MESSAGE_DRAFT: VisitorMessageDraft = { name: '', phone: '', message: '' };
