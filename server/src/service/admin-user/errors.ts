// Fires when the admin user named in the route does not exist. Maps to 404.
export class AdminUserNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing admin user, found none with id '${id}'`);
    this.name = 'AdminUserNotFoundError';
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

// Fires when an administrator tries to deactivate their own account. Maps
// to 409: locking yourself out of the admin panel with no other admin
// session to undo it is a state worth blocking outright.
export class CannotDeactivateSelfError extends Error {
  constructor() {
    super('An administrator cannot deactivate their own account');
    this.name = 'CannotDeactivateSelfError';
  }
}

// Fires when a chosen password is shorter than the required minimum. Maps to 400.
export class WeakPasswordError extends Error {
  constructor(public readonly minimumLength: number) {
    super(`Password must be at least ${minimumLength} characters long`);
    this.name = 'WeakPasswordError';
  }
}

// Fires when a deactivation or a delete targets the super admin, regardless
// of who is asking. Maps to 409: the super admin can never be deactivated
// or deleted, by anyone, under any circumstance.
export class CannotModifySuperAdminError extends Error {
  constructor() {
    super('The super admin account can never be deactivated or deleted');
    this.name = 'CannotModifySuperAdminError';
  }
}

// Fires when a delete is attempted on an admin whose account is still
// active. Maps to 409: an admin must be deactivated first, so a delete is
// never the first action taken against a live account.
export class AdminUserStillActiveError extends Error {
  constructor(id: string) {
    super(`Admin user '${id}' must be deactivated before it can be deleted`);
    this.name = 'AdminUserStillActiveError';
  }
}
