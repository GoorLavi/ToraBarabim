import { css } from 'styled-components';

import { PADDING_INLINE } from './consts';

// Radius `md` here, not the `lg` the lesson cards and rows use: this is a
// chip, not a card (design spec, "City chip").
export const CityChip = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  padding-block: ${theme.spacing.md};
  padding-inline: ${PADDING_INLINE};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  text-decoration: none;
  overflow-wrap: break-word;

  &:hover {
    border-color: ${theme.colors.primary};
  }

  &:active {
    background: ${theme.colors.primarySoft};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  > .name {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .count {
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.regular};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }
`,
);
