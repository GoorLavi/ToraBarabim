// Fires when no lesson exists with the given id. Maps to 404.
export class LessonNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing lesson, found none with id '${id}'`);
    this.name = 'LessonNotFoundError';
  }
}

// Fires when a create/update names a rabbiId that does not exist, so the
// foreign key never gets a chance to surface as a 500. Maps to 400.
export class ReferencedRabbiNotFoundError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Expected an existing rabbi, found none with id '${rabbiId}'`);
    this.name = 'ReferencedRabbiNotFoundError';
  }
}

// Fires when a create/update names a place.cityCode that does not resolve
// to a row in `cities`. Cities are reference data, chosen never created.
// Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected a known city code, got '${cityCode}'`);
    this.name = 'UnknownCityError';
  }
}
