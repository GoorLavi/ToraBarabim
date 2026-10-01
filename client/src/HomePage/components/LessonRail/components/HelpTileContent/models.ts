import type { ReactNode } from 'react';

export interface HelpTileContentProps {
  className?: string;
  icon: ReactNode;
  title: string;
  line: string;
  // The label of the button-shaped pill. The pill is decoration: the whole
  // tile is the press target, so nothing here is a control of its own.
  buttonLabel: string;
  // What the icon circle is filled with: a tinted tile uses `surface`, the
  // surface tile `primarySoft`, so the circle always reads against its field.
  iconCircle: 'surface' | 'primarySoft';
}
