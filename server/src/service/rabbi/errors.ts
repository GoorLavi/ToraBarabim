// Fires when no rabbi exists with the given id. Maps to 404.
export class RabbiNotFoundError extends Error {
  constructor(id: string) {
    super(`no rabbi found with id ${id}`);
    this.name = 'RabbiNotFoundError';
  }
}
