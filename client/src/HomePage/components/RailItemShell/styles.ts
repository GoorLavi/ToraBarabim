import { css } from 'styled-components';

import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

export const RailItemShell = css(
  ({ theme }) => `
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  /* Fills its own list item: the rail and the grid both stretch every item
     in a row to the tallest one, and without this a shorter item would stop
     at its own natural height and leave the row's bottom edge ragged. A
     button does not stretch like a block, so the inline size is explicit. */
  inline-size: 100%;
  block-size: 100%;
  overflow: hidden;
  padding: 0;
  /* Every item carries the same 1px border box, transparent when it has no
     visible border, so the container query thresholds measure the same
     inner width on a tinted tile as on the card beside it. */
  border: 1px solid transparent;
  border-radius: ${theme.radii.lg};
  color: inherit;
  text-align: start;
  text-decoration: none;
  transition: border-color 150ms ease;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  &.surface {
    border-color: ${theme.colors.border};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.card};

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        border-color: ${theme.colors.primary};
      }
    }
  }

  &.tinted {
    &.primarySoft {
      background: ${theme.colors.primarySoft};
    }

    &.accentSoft {
      background: ${theme.colors.accentSoft};
    }
  }

  > .topArea {
    flex-shrink: 0;
    aspect-ratio: ${POSTER_ASPECT_RATIO};
  }
`,
);
