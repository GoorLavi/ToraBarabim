export const LOADING_MESSAGE = 'טוען שיעורים...';
export const RETRY_LABEL = 'נסו שוב';

// Heading and hint stay apart so the frame is the same shape everywhere on
// the site an error appears: a black heading naming what failed, a calm
// status-aware line under it, one retry (design review, Group B).
export const ERROR_HEADLINE = 'אירעה שגיאה בטעינת השיעורים';
export const NETWORK_ERROR_HINT = 'לא הצלחנו להתחבר לשרת, בדקו את החיבור לרשת ונסו שוב';
export const INVALID_REQUEST_HINT = 'לא הצלחנו לבצע את החיפוש, נסו לרענן את הדף';
export const SERVER_ERROR_HINT = 'נסו שוב מאוחר יותר';

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
  if (searchQuery) return `לא נמצאו שיעורים התואמים לחיפוש ״${searchQuery}״ ${dayLabel}${where}`;
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
      ? ` שתואם לחיפוש ״${searchQuery}״`
      : ` שתואמים לחיפוש ״${searchQuery}״`
    : '';
  return count === 1
    ? `יש שיעור אחד ${dayLabel}${where}${matchingQuery}`
    : `יש ${count} שיעורים ${dayLabel}${where}${matchingQuery}`;
};

export const moreLessonsLabel = (dayLabel: string): string => `עוד שיעורים ${dayLabel}`;

// Counts the day's own items, never `total` from the response (that covers
// the whole widened window, LESSON_WINDOW_DAYS): otherwise someone filtering
// to a small city has no honest way to tell whether the grid shows
// everything or a fraction of it.
export const dayLessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);

// The heading when the filter is a city or a search term and not a date:
// there is no single day to name, so the heading names the city (or "כל
// הארץ") and the search term instead (design-system.md, "Every data screen
// has three states").
export const filterOnlyHeadingLabel = (cityName: string | undefined, searchQuery: string): string => {
  const where = cityName ? `שיעורים ב${cityName}` : 'שיעורים בכל הארץ';
  return searchQuery ? `${where} לפי החיפוש ״${searchQuery}״` : where;
};

export const MORE_FILTERED_LESSONS_LABEL = 'עוד שיעורים';

// The dateless empty state: there is no date axis to widen along (the human
// ratified this split explicitly), so this names only the filters actually
// set, in the same window the found line above already uses, rather than
// narrowing to a single day nobody chose (design review, Group A, items 1
// and 4).
export const noFilteredLessonsHeadline = (cityName: string | undefined, searchQuery: string): string => {
  const where = cityName ? ` ב${cityName}` : '';
  const query = searchQuery ? ` לפי החיפוש ״${searchQuery}״` : '';
  return `לא נמצאו שיעורים${where}${query} בשבועיים הקרובים`;
};

// The way back from the state that carries the most weight on this site
// (design-system.md): clears whichever filter produced zero results and
// returns to the unfiltered rows, an action to press rather than prose
// advice with nothing to press (design review, Group A, item 3).
export const CLEAR_FILTERS_LABEL = 'ניקוי הסינון וחזרה לכל השיעורים';
