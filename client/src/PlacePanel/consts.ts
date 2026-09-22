// A place's own lesson list never grows past a handful of records, the same
// reasoning as RabbiPanel's `RABBI_LESSON_PAGE_SIZE`: one page is always the
// whole list. Mirrors `server/src/service/place-portal`'s own page-size
// constant.
export const PLACE_LESSON_PAGE_SIZE = 100;

// Hand-mirrored from server/src/api/place/profile/index.ts's `invalid_photo`
// response: shown as-is rather than the generic 400 copy below, since it
// already names the width, height and ratio the photo failed. The place's
// own client-side check (`ProfilePage/helpers.ts`, `validatePlacePhotoFile`)
// catches most of these before upload, but a server rejection still needs
// its own explanation rather than the generic one.
export const INVALID_PHOTO_MESSAGE = 'התמונה לא מתאימה. צריך תמונה לרוחב, לפחות 1200 על 675 פיקסלים, והרוחב גדול פי 1.5 עד 2 מהגובה.';

// Mirrors RabbiPanel/consts.ts's own copy verbatim: the same generic,
// account-neutral messages apply to a place account.
export const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה, יש לנסות שוב מאוחר יותר';
export const NETWORK_ERROR_MESSAGE = 'לא ניתן להתחבר לשרת. יש לבדוק את החיבור ולנסות שוב';
export const UNAUTHENTICATED_MESSAGE = 'תוקף ההתחברות פג. יש להתחבר מחדש';
export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NOT_FOUND_MESSAGE = 'הרשומה המבוקשת לא נמצאה';
export const RATE_LIMITED_MESSAGE = 'יותר מדי ניסיונות כניסה. יש לנסות שוב בעוד כמה דקות';

export const PLACE_QUERY_KEYS = {
  session: () => ['place', 'session'] as const,
  profile: () => ['place', 'profile'] as const,
  lessons: () => ['place', 'lessons'] as const,
  lesson: (id: string) => ['place', 'lessons', id] as const,
  // The rabbi assigned to a lesson being edited, resolved separately since
  // `PlaceLessonResponse` carries only the bare `rabbiId` (see
  // `LessonFormPage/useExistingLesson.ts`).
  lessonRabbi: (rabbiId: string) => ['place', 'lessons', 'rabbi', rabbiId] as const,
  // See `api.ts`'s `fetchRabbiDirectoryPage`: the public directory, read
  // without `q` by `useRabbiDirectory` and with it by the picker's own
  // `useRabbiSearch`, since there is still no place-scoped rabbi endpoint.
  rabbiDirectory: (scope: 'general' | 'women', q?: string) => ['place', 'rabbiDirectory', scope, q] as const,
};

export const PLACE_ROUTES = {
  // The shared login door (`PanelLogin`), not a route this panel owns.
  login: '/login',
  lessons: '/place/lessons',
  lessonNew: '/place/lessons/new',
  lessonEdit: (id: string) => `/place/lessons/${id}`,
  profile: '/place/profile',
};
