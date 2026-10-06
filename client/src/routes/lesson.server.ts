import type { AudienceScope, LessonOccurrence, LessonOccurrenceDetail } from '@torabarabim/common';
import { ZodError } from 'zod';

import type { DeferredLessons } from '~/LessonPage/models';

import { toLessonOccurrence, toLessonOccurrenceDetail } from '../../../server/src/convertors/lesson';
import { LessonNotFoundError, LessonOccurrenceNotFoundError } from '../../../server/src/service/lesson/errors';
import * as lessonService from '../../../server/src/service/lesson/lesson';
import { lessonOccurrenceParamsSchema } from '../../../server/src/service/lesson/models';
import * as placeService from '../../../server/src/service/place/place';
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
export const loadLessonOccurrence = async (
  rawLessonId: string,
  rawDate: string,
  now: Date,
): Promise<LessonOccurrenceDetail> => {
  try {
    const { lessonId, date } = lessonOccurrenceParamsSchema.parse({ lessonId: rawLessonId, date: rawDate });
    const record = await lessonService.getOccurrence(lessonId, date, now);
    return toLessonOccurrenceDetail(record);
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

// The wire `LessonVenue`'s place arm carries no photo (see `AddressPlaceRow`,
// server/src/service/shared/address.ts): a venue is resolved for every
// occurrence a search returns, and adding an image there would grow every
// list response for a field only this page's own event JSON-LD needs.
// Resolved here instead, once, only for the one occurrence this page shows.
// Fails open: a photo lookup failing is never a reason to fail the whole
// lesson page, so this returns `undefined` on any error rather than
// rejecting, the same as `loadAreaLessonsPreview` below.
export const loadVenuePhoto = async (occurrence: LessonOccurrence): Promise<string | undefined> => {
  if (occurrence.venue.kind !== 'place') return undefined;
  try {
    const place = await placeService.getById(occurrence.venue.placeId);
    return place.photoUrl;
  } catch (error) {
    console.error('Failed to load venue photo', {
      lessonId: occurrence.lessonId,
      placeId: occurrence.venue.placeId,
      error,
    });
    return undefined;
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
): { areaName: string; areaSlug: string } => ({
  areaName: AREA_NAMES_HE[occurrence.venue.area],
  areaSlug: toAreaSlug(occurrence.venue.area),
});

// Both deferred reads below are never awaited by the loader, so neither holds
// up the ticket. Each fails open: a failed read is a below-the-fold nicety, not
// a reason for the page itself to fail, so the catch resolves to `unavailable`
// instead of rejecting; the `try`/`catch` inside the `async` function is what
// guarantees the returned promise itself never rejects. The area's name and
// slug are resolved synchronously in the route loader from
// `occurrence.venue.area`, so the area read only ever carries the query result.
export const loadAreaLessonsPreview = async (occurrence: LessonOccurrence, now: Date): Promise<DeferredLessons> => {
  try {
    const items = await lessonService.searchAreaPreview(
      {
        area: occurrence.venue.area,
        excludeRabbiId: occurrence.rabbi.id,
        scope: areaPreviewScopeFor(occurrence),
      },
      now,
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

export const loadRabbiUpcomingLessons = async (occurrence: LessonOccurrence, now: Date): Promise<DeferredLessons> => {
  try {
    const items = await lessonService.searchRabbiUpcoming(
      {
        rabbi: { id: occurrence.rabbi.id, honorific: occurrence.rabbi.honorific },
        lessonId: occurrence.lessonId,
        date: occurrence.date,
      },
      now,
    );

    return { kind: 'ready', items: items.map(toLessonOccurrence) };
  } catch (error) {
    console.error('Failed to load rabbi upcoming lessons', {
      lessonId: occurrence.lessonId,
      rabbiId: occurrence.rabbi.id,
      error,
    });
    return { kind: 'unavailable' };
  }
};
