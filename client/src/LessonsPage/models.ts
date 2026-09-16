import type { AudienceFilter } from '@torabarabim/common';

export interface LessonsPageProps {
  className?: string;
}

// Read straight from the URL and passed through to the API as-is: this
// round's filter band has no rabbi, area or topic control, so these two
// only ever arrive as a link from elsewhere (a rabbi page, a city page).
// The server is the one place that knows their valid values, so an invalid
// one surfaces as its own 400, not a client-side guess. `audience` is
// narrowed client-side instead, through the same `men` | `mixed` guard the
// header's own audience control uses (hooks/helpers.ts,
// isAudienceFilterValue): the wire never accepts `women` as a filter value
// (common/src/lesson.ts), so `?audience=women` reads as unfiltered rather
// than forwarding an invalid value.
export interface PassThroughFilters {
  rabbiId?: string;
  area?: string;
  topic?: string;
  audience?: AudienceFilter;
}

export interface LessonsFilters extends PassThroughFilters {
  from: string;
  to: string;
  city?: string;
  q?: string;
  pageSize: number;
}
