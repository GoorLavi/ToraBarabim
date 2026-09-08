import { css } from 'styled-components';

import { contentBandCap, contentGutterInline } from '~/styles/contentBand';

import { HEADER_Z_INDEX } from '../../consts';
import { headerBandAppearance } from '../../styles';

// Fixed, not sticky, and hidden by default: below `lg` the full header
// scrolls away in normal flow, and this separate element takes its place
// once it has completely left the viewport. Hidden at `lg` and up, where
// the real header is sticky instead and never collapses.
export const PinnedHeaderBar = css(
  ({ theme }) => `
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: ${HEADER_Z_INDEX};
  transform: translateY(-100%);
  transition: transform 160ms ease-out;

  &.visible {
    transform: translateY(0);
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  > .collapsedBar {
    ${contentGutterInline(theme)}
    background: ${theme.colors.primary};
    box-shadow: ${theme.shadows.raised};
    padding-block: ${theme.spacing.sm};
    block-size: 64px;

    > .collapsedBarInner {
      ${contentBandCap(theme)}
      block-size: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: ${theme.spacing.md};
    }
  }

  > .catcher {
    position: fixed;
    inset: 0;
    background: transparent;
  }

  > .expandedPanel {
    ${headerBandAppearance(theme)}
    position: relative;
    box-shadow: ${theme.shadows.raised};
  }
`,
);
