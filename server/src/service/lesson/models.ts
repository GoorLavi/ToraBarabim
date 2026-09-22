import type { LessonAudience, LessonTopic, LessonVenue, Rabbi } from '@torabarabim/common';
import { z } from 'zod';

import { AREAS, LESSON_TOPICS } from '../../db/schema/enums';
import { AUDIENCE_FILTERS, AUDIENCE_SCOPES, DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../shared/consts';
import { MAX_SEARCH_QUERY_LENGTH } from './consts';

// `from`/`to` stay optional here: the service resolves their defaults
// against Israel time, which a static schema cannot know at definition time.
// `city` is the city's official code (`cities.code`), the same id a client
// gets back from `GET /v1/cities`, not the Hebrew name.
// `q` has no `.min(1)`: an empty string must pass validation and be treated
// as "no filter", the same as an absent parameter, per the search contract.
// `audience` narrows to `men` | `mixed` only: `women` is never a valid
// public filter (a rabbanit's lessons reach a general search through the
// name exception, not through requesting `women` directly), so requesting
// it is a 400, not an empty result.
// `placeId` means "occurrences whose resolved venue is this place": a
// separate, orthogonal narrowing from every other filter, applied after
// `applyException` (an exception can move an occurrence away from its
// lesson's own place, or move one back onto it) and before scope/audience,
// exactly where every other post-expansion filter sits.
// `status=scheduled` is likewise orthogonal: any caller may combine it with
// any other filter, including `placeId`, without either one special-casing
// the other.
export const lessonSearchQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  city: z.coerce.number().int().positive().optional(),
  area: z.enum(AREAS).optional(),
  rabbiId: z.string().trim().min(1).optional(),
  placeId: z.string().trim().min(1).optional(),
  topic: z.enum(LESSON_TOPICS).optional(),
  audience: z.enum(AUDIENCE_FILTERS).optional(),
  status: z.enum(['scheduled', 'cancelled']).optional(),
  scope: z.enum(AUDIENCE_SCOPES).default('general'),
  q: z.string().trim().max(MAX_SEARCH_QUERY_LENGTH).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type LessonSearchQuery = z.infer<typeof lessonSearchQuerySchema>;

export const lessonOccurrenceParamsSchema = z.object({
  lessonId: z.string().trim().min(1),
  date: z.iso.date(),
});

export type LessonOccurrenceParams = z.infer<typeof lessonOccurrenceParamsSchema>;

export interface ResolvedLessonSearchQuery extends LessonSearchQuery {
  from: string;
  to: string;
}

// Kept distinct from the wire `LessonOccurrence`, even though the shape
// matches today, so the convertor has a real seam if a stored row ever
// carries a field the client should never see.
export interface ResolvedLessonOccurrence {
  lessonId: string;
  date: string;
  startTime: string;
  endTime: string;
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

// The resolved rabbi/place record behind a `rabbiId`/`placeId` filter that
// was actually applied, so the convertor can echo just the display name.
// `undefined` means that filter was not sent, or was sent but named
// nothing this search recognised.
export interface AppliedSearchFilters {
  rabbi?: Rabbi;
  place?: { name: string };
}

export interface LessonSearchResult {
  items: ResolvedLessonOccurrence[];
  page: number;
  pageSize: number;
  total: number;
  appliedFilters: AppliedSearchFilters;
}
