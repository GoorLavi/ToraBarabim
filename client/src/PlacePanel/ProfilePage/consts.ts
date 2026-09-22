// Verbatim from `RabbiPanel/ProfilePage/consts.ts`: none of these name a
// rabbi or an honorific, so the same string reads correctly for a place
// account.
export const HEADING = 'הפרטים שלי';
export const PHOTO_LABEL = 'התמונה שלי';
export const LIVE_NOTE = 'מה שתשמור כאן יופיע באתר מיד.';
export const SAVE_LABEL = 'שמירת הפרטים';
export const SAVING_LABEL = 'שומר...'; // out of scope: kept exactly as the rabbi panel's, per the build brief.
export const CANCEL_LABEL = 'ביטול';
export const LOADING_MESSAGE = 'טוען...'; // out of scope: kept exactly as the rabbi panel's, per the build brief.
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את הפרטים שלך';
export const RETRY_LABEL = 'ניסיון נוסף';
export const REQUIRED_NAME_ERROR = 'יש למלא שם';

// Verbatim from `RabbiPanel/LessonFormPage/consts.ts`: the exact same
// `street`/`floor`/`cityCode` fields, asked for by the exact same labels,
// on a form that is also "where does this belong". `UNKNOWN_CITY_ERROR`
// covers the same `unknown_city` code `PlaceApiError` can carry here.
export const STREET_LABEL = 'רחוב ומספר';
export const FLOOR_LABEL = 'קומה / הערת הגעה';
export const CITY_LABEL = 'עיר';
export const CITY_HELPER = 'בחר עיר מהרשימה.';
export const CITY_PLACEHOLDER = 'בחירת עיר';
export const REQUIRED_STREET_ERROR = 'יש למלא רחוב ומספר';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const UNKNOWN_CITY_ERROR = 'העיר שנבחרה אינה קיימת יותר. יש לבחור עיר אחרת';

// Verbatim from `RabbiPanel/LessonFormPage/consts.ts`'s `PLACE_NAME_LABEL`:
// the exact same field ("the name of this synagogue or institution"), asked
// on this place's own profile instead of on a lesson pointing at it.
export const NAME_LABEL = 'שם בית הכנסת או המוסד';

// No counterpart anywhere in the codebase: needs the editor's pass.
// PLACEHOLDER, listed in the build report.
export const SUBTEXT = '[יש להשלים: כך המקום מופיע באתר, בכרטיס ובעמוד שלו.]';
// PLACEHOLDER: the full-address helper under "street" here is about this
// place's own public page, not "the lesson page" the rabbi form's identical
// field points at (`RabbiPanel/LessonFormPage/consts.ts`'s `STREET_HELPER`),
// so it is not a verbatim reuse. Listed in the build report.
export const STREET_HELPER = '[יש להשלים: הכתובת המלאה מוצגת בעמוד המקום.]';

// `PhotoPicker`'s own '16:9' help list (`components/PhotoPicker/consts.ts`,
// `PHOTO_HELP_SIZE['16:9']`) already states the real requirement, in
// already-approved copy, before the file dialog opens (build brief). This
// screen only needs its own copy for the one thing that component cannot
// say: the client-side dimension/ratio check below has no exported error
// string to reuse, since `PhotoPicker` itself does no pixel measuring.
// PLACEHOLDER, listed in the build report.
export const PHOTO_TOO_SMALL_ERROR = '[יש להשלים: הודעת שגיאה לתמונה קטנה מדי או ביחס לא מתאים]';

// Hand-mirrored from `server/src/service/place/consts.ts`'s
// `PLACE_PHOTO_MIN_WIDTH` / `PLACE_PHOTO_MIN_HEIGHT` /
// `PLACE_PHOTO_MIN_ASPECT_RATIO` / `PLACE_PHOTO_MAX_ASPECT_RATIO`, the same
// values `components/PhotoPicker/consts.ts` mirrors for its own help text:
// no shared import path to the server's own values, so this is a second,
// independent copy naming its source, for the client-side check below.
export const RATIO_MIN = 1.5;
export const RATIO_MAX = 2.0;
export const MIN_WIDTH_PX = 1200;
export const MIN_HEIGHT_PX = 675;
