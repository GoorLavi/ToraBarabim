export const LOADING_MESSAGE = 'טוען שיעורים...';
export const RETRY_LABEL = 'נסו שוב';

export const NETWORK_ERROR_MESSAGE = 'לא הצלחנו להתחבר לשרת, בדקו את החיבור לרשת ונסו שוב';
export const INVALID_REQUEST_MESSAGE = 'לא הצלחנו לבצע את החיפוש, נסו לרענן את הדף';
export const SERVER_ERROR_MESSAGE = 'אירעה שגיאה בטעינת השיעורים, נסו שוב מאוחר יותר';

// No date in the label itself: the heading directly above already states
// the day (and city), so a custom date once repeated here either produced
// broken Hebrew (a bare date needs a "ב" preposition English word order
// doesn't) or wrapped the row at narrow widths. Static text stays correct
// for every day (design review round 2, B2/P1).
export const SEE_ALL_LABEL = 'לכל השיעורים';

// A terminal empty state: nothing found in the whole widened window
// (HomePage/consts.ts, LESSON_WINDOW_DAYS). Named as a real dead end rather
// than pretending a result is coming (root CLAUDE.md, error messages). No
// city named in the "all areas" state (design-system.md, "No default city").
// When a search query is active, the headline names it too, or it reads as
// if the search was silently dropped.
export const noLessonsHeadline = (dayLabel: string, cityName: string | undefined, searchQuery: string): string => {
  const where = cityName ? ` ב${cityName}` : '';
  if (searchQuery) return `לא נמצאו שיעורים התואמים לחיפוש "${searchQuery}" ${dayLabel}${where}`;
  return `אין שיעורים ${dayLabel}${where}`;
};

export const noLessonsHint = (searchQuery: string): string =>
  searchQuery
    ? 'נסו מילת חיפוש אחרת, עיר אחרת או תאריך אחר. מגידי השיעור מוסיפים ומעדכנים שיעורים באתר באופן שוטף.'
    : 'נסו לבחור עיר אחרת או תאריך אחר. מגידי השיעור מוסיפים ומעדכנים שיעורים באתר באופן שוטף.';

export const nextDayCountLabel = (
  count: number,
  dayLabel: string,
  cityName: string | undefined,
  searchQuery: string,
): string => {
  const where = cityName ? ` ב${cityName}` : '';
  const matchingQuery = searchQuery
    ? count === 1
      ? ` שתואם לחיפוש "${searchQuery}"`
      : ` שתואמים לחיפוש "${searchQuery}"`
    : '';
  return count === 1
    ? `יש שיעור אחד ${dayLabel}${where}${matchingQuery}`
    : `יש ${count} שיעורים ${dayLabel}${where}${matchingQuery}`;
};

export const moreLessonsLabel = (dayLabel: string): string => `עוד שיעורים ${dayLabel}`;
