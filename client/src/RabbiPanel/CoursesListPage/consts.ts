export const HEADING = 'הקורסים שלי';

export const countLabel = (n: number): string => {
  if (n === 0) return 'אין כרגע באתר קורסים על שמך.';
  if (n === 1) return 'קורס אחד מופיע באתר על שמך.';
  return `${n} קורסים מופיעים באתר על שמך.`;
};

export const ADD_COURSE_LABEL = 'הוספת קורס';

export const LOADING_MESSAGE = 'טוענים...';

export const EMPTY_HEADLINE = 'עוד לא הוספת קורס';
export const EMPTY_HINT = 'קורס הוא סדרת שיעורים עם תאריך פתיחה ומספר שבועות קבוע. כל קורס שיתווסף יופיע באתר מיד אחרי השמירה.';
export const EMPTY_CTA = 'הוספת הקורס הראשון';

export const ERROR_MESSAGE = 'לא הצלחנו לטעון את הקורסים שלך';
export const RETRY_LABEL = 'ניסיון נוסף';
