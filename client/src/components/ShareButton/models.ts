import type { ShareSurface } from '~/analytics/consts';

export interface ShareButtonProps {
  className?: string;
  // What the message says, without the link: native share puts the link on
  // its own last line, and a copy carries the link alone.
  text: string;
  url: string;
  // `light` sits on the page, `plum` on a `primary` field (a page hero).
  tone: 'light' | 'plum';
  surface: ShareSurface;
}

export type CopyStatus = 'idle' | 'copied' | 'failed';
