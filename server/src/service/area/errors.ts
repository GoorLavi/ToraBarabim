// Fires when no area's slug matches the requested value. Maps to 404.
export class AreaNotFoundError extends Error {
  constructor(slug: string) {
    super(`no area found with slug '${slug}'`);
    this.name = 'AreaNotFoundError';
  }
}
