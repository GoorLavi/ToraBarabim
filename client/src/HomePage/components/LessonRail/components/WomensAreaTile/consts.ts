import { lessonCountLabel } from '~/consts';

export const TILE_HEADING = 'שיעורים לנשים';
export const TILE_LINE = 'לפי יום, לפי עיר ולפי רב או רבנית';
export const TILE_LINK_LABEL = 'לכל השיעורים לנשים';

// 44 percent of the tile's own width, at each of the three widths a rail
// card steps through (LessonRail/consts.ts, CARD_WIDTH_PHONE/MD/LG).
export const EMBLEM_SIZE_PHONE = 88;
export const EMBLEM_SIZE_MD = 96;
export const EMBLEM_SIZE_WIDE = 104;
// The floor the emblem shrinks to, first, if the plum area ever runs short
// (styles.ts's container queries): below this it stops reading as
// candlesticks.
export const EMBLEM_SIZE_FLOOR = 72;

// The plum area shows the bare numeral large, and the word beneath it
// switches singular/plural on its own; `lessonCountLabel` (which spells the
// singular out as "שיעור אחד") is used only for the accessible label, where
// a bare "1" would read as ambiguous.
export const tileCountWord = (count: number): string => (count === 1 ? 'שיעור' : 'שיעורים');

export const tileAriaLabel = (lessonCount: number): string => `${TILE_HEADING}, ${lessonCountLabel(lessonCount)}, ${TILE_LINK_LABEL}`;
