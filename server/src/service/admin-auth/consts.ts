// Login attempt rate limit: applied only to the login route. 10 attempts
// per 15 minutes let someone who genuinely forgets their password burn the
// whole budget in under a minute and then lock themselves out of their own
// admin panel for a quarter of an hour. A shorter window recovers faster
// while a brute-force attacker still only gets a low, bounded rate: 20
// guesses every 5 minutes is still under 6 guesses a minute forever.
export const LOGIN_RATE_LIMIT_MAX = 20;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

// The minimum for an admin password, everywhere one is chosen directly
// (the admin-user create endpoint).
export const MIN_PASSWORD_LENGTH = 6;

// Three cookies, one per role, never one cookie with a role check alone.
// `SESSION_COOKIE_NAME` is still the only cookie `POST /v1/admin/login`
// can ever populate: that route is untouched and stays role-scoped, and
// `requireAdminAuth` still reads only this cookie and still re-checks
// `role === 'admin'` on top of that, as defence in depth.
//
// The rabbi and place cookies are no longer tied to a role-scoped login
// route the way the admin one is: `POST /v1/panel/login` is one shared
// door for both, and it calls `login` without an expected role. What keeps
// them apart is the cookie, not the route: `login` reads the row's own
// `role`, and the panel route sets the cookie that belongs to that role,
// never anything the request itself asked for. Each guard still reads
// only its own cookie and still re-checks `role` before trusting the
// session, so a bug in that choice still cannot let one role's session
// pass as another's.
export const SESSION_COOKIE_NAME = 'tb_admin_session';
export const RABBI_SESSION_COOKIE_NAME = 'tb_rabbi_session';
export const PLACE_SESSION_COOKIE_NAME = 'tb_place_session';

// The two panel roots the shared login route can ever redirect into. A
// `from` outside its own role's root is never honoured: see
// `resolveLandingPath` in `landing-path.ts`.
export const RABBI_PANEL_ROOT = '/rabbi';
export const PLACE_PANEL_ROOT = '/place';

// Where each role lands with no `from`, or an untrusted one. Hand-mirrors
// `client/src/RabbiPanel/consts.ts`'s `RABBI_ROUTES.upcoming`, the rabbi
// panel's own landing screen once logged in.
export const RABBI_DEFAULT_LANDING_PATH = '/rabbi/upcoming';
// The place panel has no screens yet (Wave 6): its own root is the only
// landing path there is.
export const PLACE_DEFAULT_LANDING_PATH = '/place';
