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
