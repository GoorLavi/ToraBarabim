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

export interface HomePageProps {
  className?: string;
}
