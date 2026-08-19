import type { AdminLessonFilters, AdminPlaceFilters, AdminRabbiFilters } from './models';

// Mirrors `server/src/service/admin-shared/consts.ts`'s `MAX_ADMIN_PAGE_SIZE`.
// Used as the page size for "fetch the whole list once and join in memory"
// reads (root CLAUDE.md, Async and data access), not for user-facing paging.
export const MAX_ADMIN_PAGE_SIZE = 50;

export const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה, נסו שוב מאוחר יותר';
export const NETWORK_ERROR_MESSAGE = 'לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב';
export const UNAUTHENTICATED_MESSAGE = 'תוקף ההתחברות פג. יש להתחבר מחדש';
export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NOT_FOUND_MESSAGE = 'הרשומה המבוקשת לא נמצאה';
// The exact wording for the login rate limiter was not captured from the
// design, so this is written fresh (see the report for this slice).
export const RATE_LIMITED_MESSAGE = 'יותר מדי ניסיונות כניסה. נסו שוב בעוד כמה דקות';

export const ADMIN_QUERY_KEYS = {
  session: () => ['admin', 'session'] as const,
  rabbis: (filters: AdminRabbiFilters) => ['admin', 'rabbis', 'search', filters] as const,
  rabbi: (id: string) => ['admin', 'rabbis', id] as const,
  rabbiDeletePreview: (id: string) => ['admin', 'rabbis', id, 'delete-preview'] as const,
  lessons: (filters: AdminLessonFilters) => ['admin', 'lessons', 'search', filters] as const,
  lesson: (id: string) => ['admin', 'lessons', id] as const,
  place: (id: string) => ['admin', 'places', id] as const,
  places: (filters: AdminPlaceFilters) => ['admin', 'places', 'search', filters] as const,
  cities: (q: string) => ['admin', 'cities', 'search', q] as const,
};

export const ADMIN_ROUTES = {
  login: '/admin/login',
  lessons: '/admin/lessons',
  lessonNew: '/admin/lessons/new',
  lessonEdit: (id: string) => `/admin/lessons/${id}`,
  rabbis: '/admin/rabbis',
  rabbiNew: '/admin/rabbis/new',
  rabbiEdit: (id: string) => `/admin/rabbis/${id}`,
};
