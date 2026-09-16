import type { LessonOccurrence } from '@torabarabim/common';

import { SCROLL_STEP_RATIO } from './consts';

// `scrollLeft`'s sign in a `direction: rtl` container is not consistent
// enough to assign directly: deriving the sign from the computed direction
// and handing the whole thing to `scrollBy` sidesteps the arithmetic.
export const scrollRailBy = (element: HTMLElement, direction: 'prev' | 'next'): void => {
  const isRtl = getComputedStyle(element).direction === 'rtl';
  const amount = element.clientWidth * SCROLL_STEP_RATIO;
  const towardEnd = direction === 'next' ? 1 : -1;
  const rtlSign = isRtl ? -1 : 1;
  element.scrollBy({ left: towardEnd * rtlSign * amount, behavior: 'smooth' });
};

export type RailSlot = { kind: 'lesson'; lesson: LessonOccurrence } | { kind: 'tile' };

// The server decides the tile's position (0012: the client renders `items`
// exactly as given and never reorders them), so this only splices, never
// picks. Clamped defensively: an index the server ever sent past the end of
// its own list still renders, at the end, rather than throwing.
export const railSlots = (items: LessonOccurrence[], womensAreaTileIndex: number | undefined): RailSlot[] => {
  const slots: RailSlot[] = items.map((lesson) => ({ kind: 'lesson', lesson }));
  if (womensAreaTileIndex === undefined) return slots;

  slots.splice(Math.min(womensAreaTileIndex, slots.length), 0, { kind: 'tile' });
  return slots;
};

export interface RailScrollEdges {
  atStart: boolean;
  atEnd: boolean;
}

export const railScrollEdges = (element: HTMLElement): RailScrollEdges => {
  const maxScroll = element.scrollWidth - element.clientWidth;
  if (maxScroll <= 1) return { atStart: true, atEnd: true };

  // Browser engines also disagree on `scrollLeft`'s origin and sign in
  // RTL (0..-max in some, 0..+max in others): `Math.abs` against the known
  // travel distance avoids needing to know which convention applies here.
  const distanceFromStart = Math.abs(element.scrollLeft);
  return { atStart: distanceFromStart <= 1, atEnd: distanceFromStart >= maxScroll - 1 };
};
