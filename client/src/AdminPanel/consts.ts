import type { AdminLessonFilters, AdminRabbiFilters, AdminUserFilters } from './models';

// Mirrors `server/src/service/admin-shared/consts.ts`'s `MAX_ADMIN_PAGE_SIZE`.
// Used as the page size for "fetch the whole list once and join in memory"
// reads (root CLAUDE.md, Async and data access), not for user-facing paging.
export const MAX_ADMIN_PAGE_SIZE = 50;

// Mirrors the server's `MIN_PASSWORD_LENGTH` (server/src/service/admin-auth/consts.ts).
// The common ancestor of AdminFormPage's create-admin form and AdminCard's
// set-password dialog, both of which validate a password against it (root
// CLAUDE.md, Scope and Boundaries: a threshold lives in one place).
export const MIN_PASSWORD_LENGTH = 12;
export const PASSWORD_TOO_SHORT_ERROR = `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`;
export const PASSWORD_MISMATCH_ERROR = 'הסיסמאות אינן תואמות';

export const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה, נסה שוב מאוחר יותר';
export const NETWORK_ERROR_MESSAGE = 'לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב';
export const UNAUTHENTICATED_MESSAGE = 'תוקף ההתחברות פג. יש להתחבר מחדש';
export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NOT_FOUND_MESSAGE = 'הרשומה המבוקשת לא נמצאה';
// The exact wording for the login rate limiter was not captured from the
// design, so this is written fresh (see the report for this slice).
export const RATE_LIMITED_MESSAGE = 'יותר מדי ניסיונות כניסה. נסה שוב בעוד כמה דקות';

export const ADMIN_QUERY_KEYS = {
  session: () => ['admin', 'session'] as const,
  rabbis: (filters: AdminRabbiFilters) => ['admin', 'rabbis', 'search', filters] as const,
  rabbi: (id: string) => ['admin', 'rabbis', id] as const,
  rabbiDeletePreview: (id: string) => ['admin', 'rabbis', id, 'delete-preview'] as const,
  rabbiAccount: (id: string) => ['admin', 'rabbis', id, 'account'] as const,
  lessons: (filters: AdminLessonFilters) => ['admin', 'lessons', 'search', filters] as const,
  lesson: (id: string) => ['admin', 'lessons', id] as const,
  adminUsers: (filters: AdminUserFilters) => ['admin', 'admin-users', 'search', filters] as const,
};

export const ADMIN_ROUTES = {
  login: '/admin/login',
  lessons: '/admin/lessons',
  lessonNew: '/admin/lessons/new',
  lessonEdit: (id: string) => `/admin/lessons/${id}`,
  rabbis: '/admin/rabbis',
  rabbiNew: '/admin/rabbis/new',
  rabbiEdit: (id: string) => `/admin/rabbis/${id}`,
  admins: '/admin/admins',
  adminNew: '/admin/admins/new',
};
