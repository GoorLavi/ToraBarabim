// Every chip resolves to one day, never a range: the ratified empty state
// widens forward from that single day (see LESSON_WINDOW_DAYS in consts.ts).
export type DateFilterOption = 'today' | 'tomorrow' | 'shabbat' | 'custom';

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
