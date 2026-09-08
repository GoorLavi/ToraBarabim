export interface LessonsPageProps {
  className?: string;
}

// Read straight from the URL and passed through to the API as-is: this
// round's filter band has no rabbi, area, topic or audience control, so
// these only ever arrive as a link from elsewhere (a rabbi page, a city
// page). The server is the one place that knows the valid values, so an
// invalid one surfaces as its own 400, not a client-side guess.
export interface PassThroughFilters {
  rabbiId?: string;
  area?: string;
  topic?: string;
  audience?: string;
}

export interface LessonsFilters extends PassThroughFilters {
  from: string;
  to: string;
  city?: string;
  q?: string;
  pageSize: number;
}
