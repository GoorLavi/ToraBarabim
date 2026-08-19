// Every chip resolves to one day, never a range: the ratified empty state
// widens forward from that single day (see LESSON_WINDOW_DAYS in consts.ts).
// 'all' means no date filter at all, the default, and is kept out of the
// URL so a clean URL is the default state (useDateFilter.ts).
export type DateFilterOption = 'all' | 'today' | 'tomorrow' | 'shabbat' | 'custom';

// Rail mode (no date filter, no city, no search query) renders whatever
// `GET /v1/home` returns, unfiltered and unsorted by the client. Any filter
// switches to the existing single filtered list. There is no in-between
// state (resolveHomeMode in helpers.ts is the one place that decides).
export type HomeMode = 'rail' | 'filtered';

export interface LessonFilters {
  from: string;
  to: string;
  city?: string;
  pageSize?: number;
  q?: string;
}

export interface SelectedCity {
  id: string;
  name: string;
}

export interface HomePageProps {
  className?: string;
}
