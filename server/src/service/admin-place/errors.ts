// Fires when no place exists with the given id. Maps to 404.
export class PlaceNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing place, found none with id '${id}'`);
    this.name = 'PlaceNotFoundError';
  }
}

// Fires when the given cityId does not resolve to a row in `cities`.
// Cities are reference data, chosen never created. Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityId: string) {
    super(`Expected a known city id, got '${cityId}'`);
    this.name = 'UnknownCityError';
  }
}

// Fires when DELETE is called without `confirm=true`. Carries the impact
// preview so the route can hand it straight back in the 409 body.
export class PlaceDeleteConfirmationRequiredError extends Error {
  constructor(
    public readonly lessonCount: number,
    public readonly exceptionCount: number,
  ) {
    super(`Deleting this place requires confirmation: it would destroy ${lessonCount} lesson(s) and ${exceptionCount} exception(s)`);
    this.name = 'PlaceDeleteConfirmationRequiredError';
  }
}
