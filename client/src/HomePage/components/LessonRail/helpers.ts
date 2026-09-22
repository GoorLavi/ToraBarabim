import type { LessonOccurrence } from '@torabarabim/common';

import type { Theme } from '~/theme/models';

import { SCROLL_STEP_RATIO } from './consts';

// Which of the rail's two horizontal bands the inline edge offset is
// computed for: `gutter` below `md`, where it is just the page's own side
// padding; `full` from `md` up, where the band is the site's real content
// cap (`theme.layout.contentMaxWidth`). That expression is a flat
// `theme.spacing.xl` below `xl` itself, since the viewport has not yet
// reached the cap, and grows past it above `xl`.
export type RailEdgeZone = 'gutter' | 'full';

// The inline distance from the true viewport edge to the rail's own band
// edge, at any width: below `md` this is just the band's own gutter
// (`~/styles/contentBand.ts`, `contentGutterInline`); from `md` up it also
// has to reproduce the band's cap, since the rail bleeds past the band
// entirely (`margin-inline: calc(-1 * ...)` in styles.ts) and so gets none
// of the band's own centring for free once the viewport is wider than that
// cap. This mirrors `contentGutterInline`'s own centring formula; the rail,
// having escaped that parent, is the one place this combined value is
// needed as a single number, which is why it lives here rather than in
// contentBand.ts (root CLAUDE.md, "no abstraction before the second real
// caller").
export const railEdgeOffset = (theme: Theme, zone: RailEdgeZone): string => {
  switch (zone) {
    case 'gutter':
      return theme.spacing.lg;
    case 'full':
      return `max(${theme.spacing.xl}, calc((100vw - ${theme.layout.contentMaxWidth}) / 2))`;
  }
};

// The rail's card width at a given column count, computed the same way the
// grid's own `1fr` columns resolve theirs: the viewport, minus the band's
// edge offset on both sides, minus the gaps between columns, divided by
// the column count. Phone-only now: from `md` up the card is a fixed width
// (RAIL_CARD_WIDTH_DESKTOP, consts.ts), not a column count against the
// viewport, so this formula is only ever called with RAIL_COLUMNS_PHONE and
// the `gutter` offset.
// The `theme.spacing.lg` here is the grid's own gap, which this width is
// derived from and which must stay 16 regardless of the row's own `gap` in
// styles.ts (`sm` on a phone), so the difference between the two surfaces
// as peek.
export const railCardWidth = (theme: Theme, columns: number, edgeOffset: string): string =>
  `calc((100vw - 2 * ${edgeOffset} - ${columns - 1} * ${theme.spacing.lg}) / ${columns})`;

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

interface RailScrollMetrics {
  maxScroll: number;
  distanceFromStart: number;
}

// Browser engines disagree on `scrollLeft`'s origin and sign in RTL (0..-max
// in some, 0..+max in others): `Math.abs` against the known travel distance
// avoids needing to know which convention applies here.
const railScrollMetrics = (element: HTMLElement): RailScrollMetrics => ({
  maxScroll: element.scrollWidth - element.clientWidth,
  distanceFromStart: Math.abs(element.scrollLeft),
});

export interface RailScrollEdges {
  atStart: boolean;
  atEnd: boolean;
}

export const railScrollEdges = (element: HTMLElement): RailScrollEdges => {
  const { maxScroll, distanceFromStart } = railScrollMetrics(element);
  if (maxScroll <= 1) return { atStart: true, atEnd: true };

  return { atStart: distanceFromStart <= 1, atEnd: distanceFromStart >= maxScroll - 1 };
};
