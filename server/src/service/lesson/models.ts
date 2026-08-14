import type { LessonAudience, LessonTopic, Place, Rabbi } from '@torabarabim/common';
import { z } from 'zod';

import { AREAS, LESSON_AUDIENCES, LESSON_TOPICS } from '../../db/schema/enums';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_SEARCH_QUERY_LENGTH } from './consts';

// `from`/`to` stay optional here: the service resolves their defaults
// against Israel time, which a static schema cannot know at definition time.
// `city` is the city's official code (`cities.code`), the same id a client
// gets back from `GET /v1/cities`, not the Hebrew name.
// `q` has no `.min(1)`: an empty string must pass validation and be treated
// as "no filter", the same as an absent parameter, per the search contract.
export const lessonSearchQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  city: z.coerce.number().int().positive().optional(),
  area: z.enum(AREAS).optional(),
  rabbiId: z.string().trim().min(1).optional(),
  topic: z.enum(LESSON_TOPICS).optional(),
  audience: z.enum(LESSON_AUDIENCES).optional(),
  q: z.string().trim().max(MAX_SEARCH_QUERY_LENGTH).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type LessonSearchQuery = z.infer<typeof lessonSearchQuerySchema>;

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
  place: Place;
  substituteRabbi?: Rabbi;
  cancellationReason?: string;
  note?: string;
}

export interface LessonSearchResult {
  items: ResolvedLessonOccurrence[];
  page: number;
  pageSize: number;
  total: number;
}
