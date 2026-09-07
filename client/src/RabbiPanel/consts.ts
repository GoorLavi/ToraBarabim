// A rabbi's own lesson list never grows past a handful of records (design
// doc, section 4: "יש לו שלושה שיעורים, לא שלוש מאות"), so one page is
// always the whole list. Mirrors `server/src/service/rabbi-lesson/consts.ts`'s
// `MAX_RABBI_PAGE_SIZE`; every screen that lists a rabbi's lessons reads
// the value from here.
export const RABBI_LESSON_PAGE_SIZE = 100;

export const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה, נסה שוב מאוחר יותר';
export const NETWORK_ERROR_MESSAGE = 'לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב';
export const UNAUTHENTICATED_MESSAGE = 'תוקף ההתחברות פג. יש להתחבר מחדש';
export const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';
export const NOT_FOUND_MESSAGE = 'הרשומה המבוקשת לא נמצאה';
export const RATE_LIMITED_MESSAGE = 'יותר מדי ניסיונות כניסה. נסה שוב בעוד כמה דקות';

export const RABBI_QUERY_KEYS = {
  session: () => ['rabbi', 'session'] as const,
  profile: () => ['rabbi', 'profile'] as const,
  lessons: () => ['rabbi', 'lessons'] as const,
  lesson: (id: string) => ['rabbi', 'lessons', id] as const,
  occurrences: () => ['rabbi', 'occurrences'] as const,
  exceptions: (lessonId: string) => ['rabbi', 'lessons', lessonId, 'exceptions'] as const,
};

export const RABBI_ROUTES = {
  login: '/rabbi/login',
  upcoming: '/rabbi/upcoming',
  lessons: '/rabbi/lessons',
  lessonNew: '/rabbi/lessons/new',
  lessonEdit: (id: string) => `/rabbi/lessons/${id}`,
  profile: '/rabbi/profile',
};
