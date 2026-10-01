// Fires when no visitor message exists with the given id, on an update.
// Maps to 404.
export class VisitorMessageNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing visitor message, found none with id '${id}'`);
    this.name = 'VisitorMessageNotFoundError';
  }
}
