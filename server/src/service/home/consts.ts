import type { HelpTileKind, HomeTopic } from '@torabarabim/common';

// The length of the home window in days, counting today as day one.
export const HOME_WINDOW_DAYS = 14;

// The home row's own title (spec section 13): the one wording true of every
// card in the row, open or closed alike.
export const COURSE_ROW_TITLE = 'קורסים';

export const MAX_ITEMS_PER_ROW = 12;
export const MIN_ITEMS_PER_ROW = 3;

// Area rows kept after ranking: the share of MAX_HOME_LESSON_ROWS that areas
// may take, so the time and topic rows still get places on a full page.
export const MAX_AREA_ROWS = 5;

// One teacher can hold most of an area's lessons, and a row of one man's
// cards reads as a profile page rather than a listing.
export const MAX_LESSONS_PER_RABBI_PER_ROW = 2;

// Counts lesson rows only: the course row, the bands and the tiles are
// spliced in around them and are not part of the budget.
export const MAX_HOME_LESSON_ROWS = 10;

// The time-of-day rows read the occurrence's own `startTime` as "HH:MM",
// which compares correctly as a string because it is zero padded. Morning is
// everything before MORNING_ENDS_AT; midday runs up to MIDDAY_ENDS_AT.
export const MORNING_ENDS_AT = '12:00';
export const MIDDAY_ENDS_AT = '16:00';

export const HOME_CITY_GRID_CAP = 12;

export const MORNING_ROW_TITLE = 'שיעורי בוקר';
export const MIDDAY_ROW_TITLE = 'שיעורי צהריים';
export const TODAY_ROW_TITLE = 'שיעורים היום';
export const BOTH_AUDIENCES_ROW_TITLE = 'שיעורים לגברים ולנשים';
export const WEEKLY_ROW_TITLE = 'שיעורים קבועים כל שבוע';

// `other` has no row, so it has no title: the type keeps a new topic from
// shipping without one.
export const TOPIC_ROW_TITLES: Record<HomeTopic, string> = {
  gemara: 'שיעורי גמרא',
  halacha: 'שיעורי הלכה',
  parasha: 'שיעורים בפרשת השבוע',
  mussar: 'שיעורי מוסר',
  chassidut: 'שיעורי חסידות',
  tanach: 'שיעורי תנ״ך',
  machshava: 'שיעורי אמונה ומחשבה',
};

// The "לפי רב" avatar row's cap. At the widest supported layout exactly
// twelve avatars fill the rail edge to edge, so any cap of twelve or less
// ends the row flush and reads as "these are all the rabbis there are".
// Sixteen always leaves the next avatar peeking, at every width.
export const HOME_RABBI_ROW_CAP = 16;

// The women's-area tile's slot within the row that carries it: the fourth
// item (0-based index 3), at every width.
export const WOMENS_AREA_TILE_INDEX = 3;

// A row needs at least this many lessons to carry the tile, so it always
// has a real item before it. Not the same idea as MIN_ITEMS_PER_ROW (3):
// today they are close in value, but one is "a row is worth sending at
// all" and the other is "this row has a fourth slot for the tile", kept
// separate on purpose.
export const WOMENS_AREA_TILE_MIN_LESSONS = 4;

// 0-based index of the row where the scan for the tile starts (around the
// sixth rail). If no row from there has WOMENS_AREA_TILE_MIN_LESSONS items,
// the scan restarts from WOMENS_AREA_TILE_FALLBACK_FIRST_ROW, so a short page
// still carries the tile rather than silently losing it.
export const WOMENS_AREA_TILE_FIRST_CANDIDATE_ROW = 5;
export const WOMENS_AREA_TILE_FALLBACK_FIRST_ROW = 1;

// The help tiles a page can carry, each at most once. `satisfies` catches a
// member renamed or removed in `common`; the check below catches one added.
export const HELP_TILE_KINDS = ['rabbi-request', 'volunteer', 'share'] as const satisfies readonly HelpTileKind[];

const helpTileKindExhaustivenessCheck: Record<HelpTileKind, true> = {
  'rabbi-request': true,
  volunteer: true,
  share: true,
};
void helpTileKindExhaustivenessCheck;

// A help tile never takes slot 0 or slot 1: on a phone at rest slot 1 is
// still half visible, so a tile there would read as the row's second
// lesson. The owner's rule; the largest index is the row's own length,
// which means after the last card.
export const HELP_TILE_MIN_INDEX = 2;
