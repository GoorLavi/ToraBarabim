// Fires when no city's slug matches the requested value. Maps to 404.
export class CityNotFoundError extends Error {
  constructor(slug: string) {
    super(`no city found with slug '${slug}'`);
    this.name = 'CityNotFoundError';
  }
}
