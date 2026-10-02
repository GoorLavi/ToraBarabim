import type { ReactElement, ReactNode } from 'react';

import type { ThemeColors } from '~/theme/models';

// The two fills a tinted rail item can carry. A subset of the theme's own
// colour keys rather than a free string, so a tint is always a token.
export type RailItemTint = Extract<keyof ThemeColors, 'primarySoft' | 'accentSoft'>;

// `surface` is the lesson card's own look: white, bordered, carded shadow.
// `tinted` is a flat fill with neither border nor shadow, the look that says
// "not a listing". The tint travels with the variant so a `tinted` shell
// without a tint cannot be written.
export type RailItemLook = { variant: 'surface' } | { variant: 'tinted'; tint: RailItemTint };

export type RailItemShellProps = RailItemLook & {
  className?: string;
  // The optional 3:4 area at the top, the same ratio as a lesson poster
  // (HomePage/consts.ts, POSTER_ASPECT_RATIO). Never stretches: the row's
  // stretch lands in whatever follows it.
  topArea?: ReactNode;
  // The shell does not decide what element it is. A lesson card is a router
  // link, a message tile a button, the share tile an anchor, and each needs
  // its own props, so the caller renders the root and the shell hands it the
  // class to wear and the content to hold.
  renderRoot: (rootClassName: string, content: ReactNode) => ReactElement;
  children: ReactNode;
};
