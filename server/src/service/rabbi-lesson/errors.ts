// Fires when no lesson exists with the given id, *or* when it exists but
// belongs to a different rabbi. One class for both cases, deliberately:
// a rabbi probing another rabbi's lesson id must get the exact same 404 he
// would get for a random string, so the response never reveals whether the
// id belongs to someone else. Maps to 404.
export class LessonNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing lesson owned by this rabbi, found none with id '${id}'`);
    this.name = 'LessonNotFoundError';
  }
}

// Fires when a create/update names an address's cityCode that does not
// resolve to a row in `cities`. Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected a known city code, got '${cityCode}'`);
    this.name = 'UnknownCityError';
  }
}

// Fires when a create/update names a venue.placeId that does not resolve to
// an active place. Maps to 400.
export class ReferencedPlaceNotFoundError extends Error {
  constructor(public readonly placeId: string) {
    super(`Expected an existing, active place, found none with id '${placeId}'`);
    this.name = 'ReferencedPlaceNotFoundError';
  }
}
