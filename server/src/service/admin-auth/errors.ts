// Fires when the email/password combination is wrong, or the account is
// inactive. Deliberately the same class for all three cases: the route
// must respond identically so it never reveals which emails exist.
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

// Fires when the session cookie is missing, unknown, or expired.
export class SessionInvalidError extends Error {
  constructor() {
    super('Session is missing, unknown, or expired');
    this.name = 'SessionInvalidError';
  }
}
