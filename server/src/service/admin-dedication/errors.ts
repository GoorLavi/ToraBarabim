// Fires when no dedication exists with the given id, on a get, an update,
// or a takedown. Maps to 404.
export class DedicationNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing dedication, found none with id '${id}'`);
    this.name = 'DedicationNotFoundError';
  }
}
