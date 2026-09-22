// A place's own lesson list never grows past a handful of records, the same
// reasoning as RabbiPanel's `RABBI_LESSON_PAGE_SIZE`: one page is always the
// whole list. Mirrors `server/src/service/place-portal`'s own page-size
// constant.
export const PLACE_LESSON_PAGE_SIZE = 100;

// Mirrors RabbiPanel/consts.ts's own copy verbatim: the same generic,
// account-neutral messages apply to a place account.
export const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה, יש לנסות שוב מאוחר יותר';
export const NETWORK_ERROR_MESSAGE = 'לא ניתן להתחבר לשרת. יש לבדוק את החיבור ולנסות שוב';
export const UNAUTHENTICATED_MESSAGE = 'תוקף ההתחברות פג. יש להתחבר מחדש';
export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NOT_FOUND_MESSAGE = 'הרשומה המבוקשת לא נמצאה';
export const RATE_LIMITED_MESSAGE = 'יותר מדי ניסיונות כניסה. יש לנסות שוב בעוד כמה דקות';

export const PLACE_QUERY_KEYS = {
  profile: () => ['place', 'profile'] as const,
  lessons: () => ['place', 'lessons'] as const,
  lesson: (id: string) => ['place', 'lessons', id] as const,
  // The rabbi assigned to a lesson being edited, resolved separately since
  // `PlaceLessonResponse` carries only the bare `rabbiId` (see
  // `LessonFormPage/useExistingLesson.ts`).
  lessonRabbi: (rabbiId: string) => ['place', 'lessons', 'rabbi', rabbiId] as const,
  // See `useRabbiDirectory.ts`: the public directory, read as a stand-in for
  // a place-scoped rabbi search endpoint that does not exist yet.
  rabbiDirectory: (scope: 'general' | 'women') => ['place', 'rabbiDirectory', scope] as const,
};

export const PLACE_ROUTES = {
  // The shared login door (`PanelLogin`), not a route this panel owns.
  login: '/login',
  lessons: '/place/lessons',
  lessonNew: '/place/lessons/new',
  lessonEdit: (id: string) => `/place/lessons/${id}`,
  profile: '/place/profile',
};
