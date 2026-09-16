import { lessonCountLabel } from '~/consts';

export const TILE_HEADING = 'שיעורים לנשים';
export const TILE_LINE = 'לפי יום, לפי עיר ולפי רב או רבנית';
export const TILE_LINK_LABEL = 'לכל השיעורים לנשים';

// The tile's own width now tracks the rail's card width continuously
// (LessonRail/helpers.ts, railCardWidth), rather than stepping at three
// fixed breakpoints, so the emblem is sized as a live percentage of it
// instead of a matching set of fixed steps (styles.ts).
export const EMBLEM_WIDTH_PERCENT = '44%';
// The floor the emblem shrinks to, first, if the plum area ever runs short
// (styles.ts's container queries): below this it stops reading as
// candlesticks. 56 at the design's own measurement, landed on just above
// the 44 percent value a 320-wide phone's card produces (60), so the floor
// itself barely ever actually engages.
export const EMBLEM_SIZE_FLOOR = 56;

// The plum area shows the bare numeral large, and the word beneath it
// switches singular/plural on its own; `lessonCountLabel` (which spells the
// singular out as "שיעור אחד") is used only for the accessible label, where
// a bare "1" would read as ambiguous.
export const tileCountWord = (count: number): string => (count === 1 ? 'שיעור' : 'שיעורים');

export const tileAriaLabel = (lessonCount: number): string => `${TILE_HEADING}, ${lessonCountLabel(lessonCount)}, ${TILE_LINK_LABEL}`;
