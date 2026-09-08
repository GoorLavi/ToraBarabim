import { css } from 'styled-components';

import { ROW_PADDING_BLOCK } from './consts';

export const RabbiListRow = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding-block: ${ROW_PADDING_BLOCK};
  padding-inline: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  text-decoration: none;

  &:hover {
    border-color: ${theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  > .avatar {
    flex-shrink: 0;
    inline-size: 56px;
    block-size: 56px;
    border-radius: ${theme.radii.pill};
    overflow: hidden;

    &.placeholder {
      background: ${theme.colors.primarySoft};
    }

    > .photo {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }
  }

  > .text {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;

    > .name {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: break-word;
    }

    > .meta {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      overflow-wrap: break-word;
    }
  }

  > .chevron {
    flex-shrink: 0;
    inline-size: 20px;
    block-size: 20px;
    color: ${theme.colors.textSecondary};
  }
`,
);
