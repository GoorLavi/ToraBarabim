import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import { hasMoreToScrollBelow } from './helpers';

// True while the scroller has more content below what is currently
// visible, so the sheet's own bottom fade (styles.ts's `.fade`) shows only
// then: the same "there is more" signal the design system ratifies for a
// horizontal rail's inline-end fade (`HomePage/components/LessonRail`),
// turned from the inline axis to the block axis for this scroller's one
// relevant edge; a sheet's form always opens scrolled to its top, so there
// is no symmetric start fade to show.
//
// Recomputes after every render, not only on the scroll and resize events
// `LessonRail/useScrollEdges.ts`'s own version listens for: unlike a rail,
// this scroller's content itself grows and shrinks while mounted (the
// place-override toggle, a validation error appearing), and there is no
// single browser event for that. The listeners still only attach once and
// clean up on unmount.
export const useScrollBottomFade = (ref: RefObject<HTMLElement | null>): boolean => {
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    if (ref.current) setHasMoreBelow(hasMoreToScrollBelow(ref.current));
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = (): void => setHasMoreBelow(hasMoreToScrollBelow(element));
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return hasMoreBelow;
};
