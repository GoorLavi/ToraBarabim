// Login attempt rate limit: applied only to the login route. 10 attempts
// per 15 minutes let someone who genuinely forgets their password burn the
// whole budget in under a minute and then lock themselves out of their own
// admin panel for a quarter of an hour. A shorter window recovers faster
// while a brute-force attacker still only gets a low, bounded rate: 20
// guesses every 5 minutes is still under 6 guesses a minute forever.
export const LOGIN_RATE_LIMIT_MAX = 20;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

// The real minimum for an admin password, everywhere one is chosen
// directly (the CLI script, and the admin-user create endpoint). The CLI
// script's `ALLOW_WEAK_ADMIN_PASSWORD` opt-out stays local to the script;
// nothing else weakens this floor.
export const MIN_PASSWORD_LENGTH = 12;

export const SESSION_COOKIE_NAME = 'tb_admin_session';
// A distinct cookie, not just a role check on the same cookie, so an
// administrator's browser and a rabbi's browser session are two separate
// cookies by construction: nothing about a rabbi login can ever populate
// the cookie an admin route reads, or the reverse.
export const RABBI_SESSION_COOKIE_NAME = 'tb_rabbi_session';
