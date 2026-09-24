import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import { railScrollEdges } from './helpers';
import type { RailScrollEdges } from './helpers';

// Tracks which end of the rail is currently reachable so the prev/next
// buttons can go disabled, not hidden, at the ends: the row never shifts.
export const useScrollEdges = (ref: RefObject<HTMLElement | null>): RailScrollEdges => {
  const [edges, setEdges] = useState<RailScrollEdges>({ atStart: true, atEnd: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = (): void => setEdges(railScrollEdges(element));
    update();

    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return edges;
};
