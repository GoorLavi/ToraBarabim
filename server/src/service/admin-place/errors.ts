// Fires when no place exists with the given id, active or not: unlike the
// public place service, an administrator can look up and edit a
// deactivated place (there is no delete, only this flag; see 0004). Maps
// to 404.
export class PlaceNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing place, found none with id '${id}'`);
    this.name = 'PlaceNotFoundError';
  }
}

// Fires when a create/update names a cityCode that does not resolve to a
// row in `cities`. Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected a known city code, got '${cityCode}'`);
    this.name = 'UnknownCityError';
  }
}

// Fires when the place named in the route already has a login account.
// Maps to 409.
export class PlaceAccountAlreadyExistsError extends Error {
  constructor(placeId: string) {
    super(`Place '${placeId}' already has a login account`);
    this.name = 'PlaceAccountAlreadyExistsError';
  }
}

// Fires when the place has no login account yet, on a reset, get, or
// deactivate call. Maps to 404.
export class PlaceAccountNotFoundError extends Error {
  constructor(placeId: string) {
    super(`Place '${placeId}' has no login account`);
    this.name = 'PlaceAccountNotFoundError';
  }
}

// Fires when the given email is already used by another account. Maps to 409.
export class DuplicateEmailError extends Error {
  constructor(public readonly email: string) {
    super(`An account with email '${email}' already exists`);
    this.name = 'DuplicateEmailError';
  }
}

// Fires when the given username is already used by another account. Maps to 409.
export class DuplicateUsernameError extends Error {
  constructor(public readonly username: string) {
    super(`An account with username '${username}' already exists`);
    this.name = 'DuplicateUsernameError';
  }
}
