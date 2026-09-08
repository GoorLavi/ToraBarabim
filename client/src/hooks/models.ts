// Every chip resolves to one day, never a range: the ratified empty state
// widens forward from that single day (HomePage/consts.ts,
// LESSON_WINDOW_DAYS). 'all' means no date filter at all, the default, and
// is kept out of the URL so a clean URL is the default state
// (useDateFilter.ts).
export type DateFilterOption = 'all' | 'today' | 'tomorrow' | 'shabbat' | 'custom';

export interface SelectedCity {
  id: string;
  name: string;
}
