// Fires when the place row behind an authenticated place session no longer
// exists. This should not happen in ordinary operation; kept as a named
// error, not an assertion, so a data inconsistency still maps to a clean
// 404 instead of an unhandled 500. Mirrors `rabbi-profile/errors.ts`'s
// `RabbiNotFoundError`.
export class PlaceNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing place, found none with id '${id}'`);
    this.name = 'PlaceNotFoundError';
  }
}

// Fires when no lesson exists with the given id, *or* when it exists but
// is held at a different place. One class for both cases, deliberately: a
// place probing another place's lesson id must get the exact same 404 it
// would get for a random string (0015's precedent for a rabbi, applied
// here), so the response never reveals whether the id belongs to someone
// else. Maps to 404.
export class LessonNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing lesson held at this place, found none with id '${id}'`);
    this.name = 'LessonNotFoundError';
  }
}

// Fires when a create/update names a rabbiId that does not exist. A place
// may name any rabbi it hosts with no consent step (the owner's
// deliberate call), but a rabbi that does not exist at all still cannot be
// saved. Maps to 400.
export class ReferencedRabbiNotFoundError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Expected an existing rabbi, found none with id '${rabbiId}'`);
    this.name = 'ReferencedRabbiNotFoundError';
  }
}

// Required by `verifyReferences`'s `onUnknownCity` callback (`lesson.ts`),
// but unreachable from there: a place lesson never carries a `cityCode` of
// its own, so that path never checks one. Genuinely reachable from
// `profile.ts`, when an update names an unknown `cityCode` for the place
// itself. Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected a known city code, got '${cityCode}'`);
    this.name = 'UnknownCityError';
  }
}
