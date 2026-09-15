import { lessonCountLabel } from '~/consts';

export const TILE_HEADING = 'שיעורים לנשים';
export const TILE_LINE = 'לפי יום, לפי עיר ולפי רב או רבנית';
export const TILE_LINK_LABEL = 'לכל השיעורים לנשים';

export const EMBLEM_SIZE_PHONE = 88;
export const EMBLEM_SIZE_WIDE = 104;

// The plum area shows the bare numeral large, and the word beneath it
// switches singular/plural on its own; `lessonCountLabel` (which spells the
// singular out as "שיעור אחד") is used only for the accessible label, where
// a bare "1" would read as ambiguous.
export const tileCountWord = (count: number): string => (count === 1 ? 'שיעור' : 'שיעורים');

export const tileAriaLabel = (lessonCount: number): string => `${TILE_HEADING}, ${lessonCountLabel(lessonCount)}, ${TILE_LINK_LABEL}`;
