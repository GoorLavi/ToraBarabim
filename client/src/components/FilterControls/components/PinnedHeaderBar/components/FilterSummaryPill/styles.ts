import { css } from 'styled-components';

import { LABEL_MAX_WIDTH_DESKTOP_PX, LABEL_MAX_WIDTH_PHONE_PX } from './consts';

export const FilterSummaryPill = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: ${theme.spacing.xs};
  min-block-size: 48px;
  padding-inline: ${theme.spacing.lg};
  border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.textOnPrimary};
  background: transparent;
  color: ${theme.colors.textOnPrimary};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.secondary.phone.fontSize};
  line-height: ${theme.typography.secondary.phone.lineHeight};

  &.active {
    border-color: ${theme.colors.surface};
    background: ${theme.colors.surface};
    color: ${theme.colors.primary};
  }

  > .icon {
    flex-shrink: 0;
    inline-size: 20px;
    block-size: 20px;
  }

  > .label {
    max-inline-size: ${LABEL_MAX_WIDTH_PHONE_PX}px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    @media (min-width: ${theme.breakpoints.md}) {
      max-inline-size: ${LABEL_MAX_WIDTH_DESKTOP_PX}px;
    }
  }

  > .chevron {
    flex-shrink: 0;
    inline-size: 16px;
    block-size: 16px;
  }
`,
);
