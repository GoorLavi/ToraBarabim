import { css } from 'styled-components';

import type { Theme } from '~/theme/models';

import { HEADER_Z_INDEX } from './consts';

// The band's paint and vertical rhythm, shared by the header itself and by
// `PinnedHeaderBar`'s expand panel below `lg`: that panel is meant to read
// as the exact same header shown again over the page, so it needs the same
// background and padding, not a copy that can drift.
export const headerBandAppearance = (theme: Theme): string => `
  background: ${theme.colors.primary};
  padding-block: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-block: ${theme.spacing.lg};
  }
`;

// Full-bleed primary band: this owns its own background edge to edge,
// independent of the page's centred, max-width content column. Sticky only
// from `lg` up; below that it scrolls away in normal flow and
// `PinnedHeaderBar` takes over once it has fully left the viewport.
export const FilterControls = css(
  ({ theme }) => `
  ${headerBandAppearance(theme)}

  @media (min-width: ${theme.breakpoints.lg}) {
    position: sticky;
    inset-block-start: 0;
    z-index: ${HEADER_Z_INDEX};

    /* Only once scrolled, so the band does not float a shadow over nothing
       at rest. */
    &.scrolled {
      box-shadow: ${theme.shadows.raised};
    }
  }
`,
);
