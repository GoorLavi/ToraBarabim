// Fires when no city exists with the given exact Hebrew name. Maps to 404.
export class CityNotFoundError extends Error {
  constructor(name: string) {
    super(`no city found with name '${name}'`);
    this.name = 'CityNotFoundError';
  }
}
