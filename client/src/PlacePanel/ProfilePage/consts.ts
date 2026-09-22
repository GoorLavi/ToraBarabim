import { PLACE_PHOTO_MIN_HEIGHT, PLACE_PHOTO_MIN_WIDTH } from '~/components/PhotoPicker/consts';

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

// The same `street`/`floor`/`cityCode` fields the WHERE section asks for on
// both lesson forms (now centralised in `~/components/PlacePicker/consts.ts`),
// asked again here since this is the place's own profile, not a lesson
// pointing at it. `UNKNOWN_CITY_ERROR` covers the same `unknown_city` code
// `PlaceApiError` can carry here.
export const STREET_LABEL = 'רחוב ומספר';
export const FLOOR_LABEL = 'קומה או הוראות הגעה';
export const CITY_LABEL = 'עיר';
export const CITY_HELPER = 'בוחרים עיר מהרשימה.';
export const CITY_PLACEHOLDER = 'בחירת עיר';
export const REQUIRED_STREET_ERROR = 'יש למלא רחוב ומספר';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const UNKNOWN_CITY_ERROR = 'העיר שנבחרה אינה קיימת יותר. יש לבחור עיר אחרת';

// Verbatim from `RabbiPanel/LessonFormPage/consts.ts`'s `PLACE_NAME_LABEL`:
// the exact same field ("the name of this synagogue or institution"), asked
// on this place's own profile instead of on a lesson pointing at it.
export const NAME_LABEL = 'שם בית הכנסת או המוסד';

export const SUBTEXT = 'כך המקום מופיע באתר, בעמוד שלו ובכל שיעור שמתקיים בו.';
// The full-address helper under "street" here is about this place's own
// public page, not "the lesson page" the rabbi form's identical field points
// at (`RabbiPanel/LessonFormPage/consts.ts`'s `STREET_HELPER`), so it is not
// a verbatim reuse.
export const STREET_HELPER = 'הכתובת המלאה מוצגת בעמוד המקום ובעמודי השיעורים שמתקיימים בו.';

// Read from `PhotoPicker`, never copied: by the time this screen's own check
// runs, the file has already been through that component's '16:9' crop step,
// so the two must agree on the floor by construction. A third copy of the
// number (the server holds the first, `PhotoPicker` the hand-mirrored second)
// would only have to be found and changed by whoever moves the floor next,
// and a stale one here would reject a crop the person was never told to
// avoid. This check is a backstop now, not the first line of defence.
export const MIN_WIDTH_PX = PLACE_PHOTO_MIN_WIDTH;
export const MIN_HEIGHT_PX = PLACE_PHOTO_MIN_HEIGHT;

// `PhotoPicker`'s own '16:9' help list (`components/PhotoPicker/consts.ts`,
// `PHOTO_HELP_SIZE['16:9']`) already states the real requirement, in
// already-approved copy, before the file dialog opens (build brief). This
// screen only needs its own copy for the one thing that component cannot
// say: the client-side dimension/ratio check below has no exported error
// string to reuse.
// The crop step is what produces this file, so it is always exactly 16:9 and
// the only thing left for this check to catch is a source too small to have
// yielded a crop at all. The message says that and nothing else: the ratio
// clause it used to carry told the person to go and satisfy by hand the one
// thing the crop step now does for them.
export const PHOTO_INVALID_ERROR = `התמונה לא מתאימה. צריך תמונה בגודל ${MIN_WIDTH_PX} על ${MIN_HEIGHT_PX} פיקסלים לפחות. אפשר לבחור תמונה אחרת.`;
