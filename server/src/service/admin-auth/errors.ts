// Fires when the email/password combination is wrong, or the row's role
// does not belong at the door that was used (the wrong role for a
// role-scoped login, or 'admin' at the shared panel door). Deliberately
// the same class for all of these: the route must respond identically so
// it never reveals which emails exist or which role one belongs to.
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

// Fires once the identifier, the password, and the role have already
// checked out, so the requester holds a valid identifier and its correct
// password: the account itself, or for a place account the place it
// manages, is inactive. This newly permits someone who already holds a
// valid identifier and its correct password to learn the account was
// deactivated rather than that the password changed. It reveals nothing
// to anyone without the password, and nothing about whether an identifier
// exists.
export class AccountDeactivatedError extends Error {
  constructor(public readonly accountId: string) {
    super('Account is deactivated');
    this.name = 'AccountDeactivatedError';
  }
}

// Fires when the session cookie is missing, unknown, or expired.
export class SessionInvalidError extends Error {
  constructor() {
    super('Session is missing, unknown, or expired');
    this.name = 'SessionInvalidError';
  }
}
