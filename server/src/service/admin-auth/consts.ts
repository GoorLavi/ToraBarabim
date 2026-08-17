// Login attempt rate limit: applied only to the login route. 10 attempts
// per 15 minutes let someone who genuinely forgets their password burn the
// whole budget in under a minute and then lock themselves out of their own
// admin panel for a quarter of an hour. A shorter window recovers faster
// while a brute-force attacker still only gets a low, bounded rate: 20
// guesses every 5 minutes is still under 6 guesses a minute forever.
export const LOGIN_RATE_LIMIT_MAX = 20;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export const SESSION_COOKIE_NAME = 'tb_admin_session';
