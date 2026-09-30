import type { ReactNode } from 'react';

export interface RailProps {
  className?: string;
  // Read by `useRailScrollTracking` as the `railTitle` on every `Rail
  // Scroll` event, so a caller's own row title doubles as the event's own
  // label rather than a second name travelling alongside it.
  title: string;
  prevLabel: string;
  nextLabel: string;
  // The row's own `<li>` items, built by the caller: this shell has no
  // opinion on what a rail carries, only on how the row scrolls.
  children: ReactNode;
}
