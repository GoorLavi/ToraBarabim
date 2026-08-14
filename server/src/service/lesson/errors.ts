// Fires when `to` is before `from`, or the requested range exceeds
// MAX_RANGE_DAYS. Maps to 400: the request itself is malformed.
export class InvalidDateRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateRangeError';
  }
}
