import type { CalendarChoice } from '../../models';

export const SHEET_TITLE = 'הוספה ליומן';

export const CALENDAR_QUESTION = 'באיזה יומן אתם משתמשים?';

export const CALENDAR_CHOICES: CalendarChoice[] = ['google', 'device'];

export const CALENDAR_CHOICE_COPY: Record<CalendarChoice, { title: string; line: string }> = {
  google: { title: 'יומן Google', line: 'ייפתח באתר של Google' },
  device: { title: 'היומן בטלפון או במחשב', line: 'יומן האייפון, Outlook ויומנים אחרים' },
};

export const ADD_ONE_TITLE = 'רק שיעור אחד';

export const SUBSCRIBE_TITLE = 'כל השיעורים הבאים, עם עדכונים';
export const SUBSCRIBE_LINE = 'השיעור יופיע ביומן בכל שבוע. אם יהיה ביטול או שינוי, היומן יתעדכן מעצמו, לפעמים רק אחרי יום.';

export const BACK_LABEL = 'חזרה לבחירת היומן';
export const CLOSE_LABEL = 'סגירה';

export const CLOSE_ICON_PATH = 'M6 6l12 12M18 6L6 18';

// An arrow pointing to the right, which in this right-to-left page is toward
// the start: the way back.
export const BACK_ICON_PATH = 'M5 12h14M13 6l6 6-6 6';

// Feather Icons' "refresh-cw" glyph (MIT licensed), viewBox 0 0 24 24: the
// subscribed calendar keeps itself up to date.
export const SUBSCRIBE_ICON_PATH = 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15';
