import type { VisitorMessageSubject } from '@torabarabim/common';

export const REPORT_PROMPT_LEAD = 'מצאתם טעות?';
export const REPORT_PROMPT_ACTION = 'כתבו לנו';

export const REPORT_WINDOW_TITLE = 'מצאתם טעות?';
export const REPORT_WINDOW_PARAGRAPHS: readonly string[] = [
  'תודה שאתם עוזרים לנו לדייק את הלוח. כתבו מה לא נכון, ונבדוק.',
];

export const REPORT_CONTEXT_LABELS: Record<VisitorMessageSubject['kind'], string> = {
  lesson: 'על השיעור הזה:',
  place: 'על המקום הזה:',
};

export const REPORT_MESSAGE_PLACEHOLDERS: Record<VisitorMessageSubject['kind'], string> = {
  lesson: 'למשל: השעה השתנתה או שהשיעור עבר למקום אחר',
  place: 'למשל: הכתובת לא נכונה או שהמקום נסגר',
};
