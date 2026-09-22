import type { LessonAudience, LessonTopic } from './lesson';
import type { LessonVenue } from './venue';
import type { Rabbi } from './rabbi';

// The display name of a rabbi or place filter the search actually applied
// and resolved, so the client can name what narrowed the results (its
// search-page heading) without re-fetching the rabbi or the place, and
// even when `items` comes back empty and there is nothing else to read a
// name from. Each key is present only when the corresponding filter was
// sent *and* resolved to an existing record; a `rabbiId` or `placeId` that
// names nothing real leaves that key absent, not a name. `rabbi` carries
// only `name`/`honorific`, never the rest of `Rabbi`, so the client still
// composes the honorific through `rabbiDisplayName`, the one place that
// happens, rather than receiving an already-composed string. The area is
// deliberately not here: the client already derives its own Hebrew name
// from the URL parameter via `AREA_NAMES_HE`, with no lookup needed, in
// every state including empty.
export interface AppliedLessonFilters {
  rabbi?: Pick<Rabbi, 'name' | 'honorific'>;
  place?: { name: string };
}

// What the search API actually returns: a Lesson's recurrence rule expanded
// across a date range, with any exception for that date already applied, and
// every id resolved to its record so the client never has to chase one.
export interface LessonOccurrence {
  lessonId: string;
  date: string; // ISO date
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  status: 'scheduled' | 'cancelled';
  title?: string;
  topic?: LessonTopic;
  audience: LessonAudience;
  rabbi: Rabbi;
  venue: LessonVenue;
  substituteRabbi?: Rabbi;
  cancellationReason?: string;
  note?: string;
}

export interface LessonSearchResponse {
  items: LessonOccurrence[];
  page: number;
  pageSize: number;
  total: number;
  appliedFilters: AppliedLessonFilters;
}
