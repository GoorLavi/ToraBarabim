import { PLACE_DEFAULT_LANDING_PATH, PLACE_PANEL_ROOT, RABBI_DEFAULT_LANDING_PATH, RABBI_PANEL_ROOT } from './consts';

export type PanelRole = 'rabbi' | 'place';

const PANEL_ROOTS: Record<PanelRole, string> = {
  rabbi: RABBI_PANEL_ROOT,
  place: PLACE_PANEL_ROOT,
};

const DEFAULT_LANDING_PATHS: Record<PanelRole, string> = {
  rabbi: RABBI_DEFAULT_LANDING_PATH,
  place: PLACE_DEFAULT_LANDING_PATH,
};

// Resolving against a placeholder origin, rather than a string prefix check
// alone, is what catches a backslash trick (`/\evil.com`): the WHATWG URL
// parser treats a backslash like a forward slash for a special scheme, so
// it can turn what looks like a path into a scheme-relative URL a prefix
// check alone would miss.
const PLACEHOLDER_ORIGIN = 'http://panel-login.invalid';

const isSameOriginRelativePath = (value: string): boolean => {
  // A leading '//' is a scheme-relative absolute URL to another host, not
  // a path, so it is rejected before ever reaching the URL parser.
  if (!value.startsWith('/') || value.startsWith('//')) return false;
  try {
    return new URL(value, PLACEHOLDER_ORIGIN).origin === PLACEHOLDER_ORIGIN;
  } catch {
    return false;
  }
};

// Resolves the `from` a client sent at login to a path it is safe to
// redirect to. Fails closed: an unrecognised, cross-origin, or another
// role's `from` is dropped in favour of the role's own default rather than
// guessed at or half-trusted. This case is genuinely new: while
// `/rabbi/login` was the only door, `from` could only ever hold a
// `/rabbi/...` path, so a shared login page is what first makes both a
// cross-role target and an open-redirect payload reachable at all.
export const resolveLandingPath = (role: PanelRole, from: string | undefined): string => {
  const defaultPath = DEFAULT_LANDING_PATHS[role];
  if (!from || !isSameOriginRelativePath(from)) return defaultPath;

  const panelRoot = PANEL_ROOTS[role];
  if (from !== panelRoot && !from.startsWith(`${panelRoot}/`)) return defaultPath;

  return from;
};
