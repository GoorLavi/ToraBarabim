// Fires when the rabbi named in the route does not exist. Maps to 404.
export class RabbiNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing rabbi, found none with id '${id}'`);
    this.name = 'RabbiNotFoundError';
  }
}

// Fires when the rabbi already has a login account. Maps to 409.
export class RabbiAccountAlreadyExistsError extends Error {
  constructor(rabbiId: string) {
    super(`Rabbi '${rabbiId}' already has a login account`);
    this.name = 'RabbiAccountAlreadyExistsError';
  }
}

// Fires when the rabbi has no login account yet, on a reset, get, or
// deactivate call. Maps to 404.
export class RabbiAccountNotFoundError extends Error {
  constructor(rabbiId: string) {
    super(`Rabbi '${rabbiId}' has no login account`);
    this.name = 'RabbiAccountNotFoundError';
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
