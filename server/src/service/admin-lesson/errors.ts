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

// Fires when a create/update names a placeId that does not exist. Maps to 400.
export class ReferencedPlaceNotFoundError extends Error {
  constructor(public readonly placeId: string) {
    super(`Expected an existing place, found none with id '${placeId}'`);
    this.name = 'ReferencedPlaceNotFoundError';
  }
}
