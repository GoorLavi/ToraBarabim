import type { AudienceScope, LessonOccurrence } from '@torabarabim/common';
import { ZodError } from 'zod';

import type { AreaPreviewLessons } from '~/LessonPage/models';

import { toLessonOccurrence } from '../../../server/src/convertors/lesson';
import { AREA_PREVIEW_LIMIT } from '../../../server/src/service/lesson/consts';
import { LessonNotFoundError, LessonOccurrenceNotFoundError } from '../../../server/src/service/lesson/errors';
import * as lessonService from '../../../server/src/service/lesson/lesson';
import { lessonOccurrenceParamsSchema } from '../../../server/src/service/lesson/models';
import { AREA_NAMES_HE, toAreaSlug } from '../../../server/src/service/shared/consts';
import { UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service, database, and
// validation schema below cannot reach the browser bundle.

// Validated with the same schema the JSON API's own route uses
// (server/src/api/lessons/index.ts), so a malformed id or date gets the
// same 400 here that it would get there, before it ever reaches the
// service. A lesson that exists but has no occurrence on the requested date
// is indistinguishable from a lesson that does not exist at all, mirroring
// the API's own handleError.
export const loadLessonOccurrence = async (rawLessonId: string, rawDate: string): Promise<LessonOccurrence> => {
  try {
    const { lessonId, date } = lessonOccurrenceParamsSchema.parse({ lessonId: rawLessonId, date: rawDate });
    const record = await lessonService.getOccurrence(lessonId, date);
    return toLessonOccurrence(record);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Response('בקשה לא תקינה', { status: 400, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    if (error instanceof LessonNotFoundError || error instanceof LessonOccurrenceNotFoundError) {
      throw new Response('השיעור לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load lesson occurrence', { lessonId: rawLessonId, date: rawDate, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};

// A rav can teach a women-only lesson (0026 only constrains a rabbanit's
// lessons, not the reverse), so the scope is keyed off the occurrence's own
// audience, never the teaching rabbi's honorific.
const areaPreviewScopeFor = (occurrence: LessonOccurrence): AudienceScope =>
  occurrence.audience === 'women' ? 'women' : 'general';

// Everything about the area preview that needs no query, resolved here
// rather than in the route module so the server constants it reads stay
// behind the `.server` boundary above.
export const resolveAreaPreviewMeta = (
  occurrence: LessonOccurrence,
): { areaName: string; areaSlug: string; limit: number } => ({
  areaName: AREA_NAMES_HE[occurrence.venue.area],
  areaSlug: toAreaSlug(occurrence.venue.area),
  limit: AREA_PREVIEW_LIMIT,
});

// Deferred by the loader (never awaited there), so this never holds up the
// ticket. Fails open: a failed area search is a below-the-fold nicety, not a
// reason for the page itself to fail, so the catch resolves to `unavailable`
// instead of rejecting; the `try`/`catch` inside this `async` function is
// what guarantees the returned promise itself never rejects. The area's name
// and slug are resolved synchronously in the route loader from
// `occurrence.venue.area`, so this only ever carries the query result.
export const loadAreaLessonsPreview = async (occurrence: LessonOccurrence): Promise<AreaPreviewLessons> => {
  try {
    const items = await lessonService.searchAreaPreview(
      {
        area: occurrence.venue.area,
        excludeLessonId: occurrence.lessonId,
        scope: areaPreviewScopeFor(occurrence),
      },
      new Date(),
    );

    return { kind: 'ready', items: items.map(toLessonOccurrence) };
  } catch (error) {
    console.error('Failed to load area lessons preview', {
      lessonId: occurrence.lessonId,
      area: occurrence.venue.area,
      error,
    });
    return { kind: 'unavailable' };
  }
};
