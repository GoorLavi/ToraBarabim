import { css } from 'styled-components';

export const SearchField = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-block-size: 48px;
  padding-inline: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  > .icon {
    flex-shrink: 0;
    inline-size: 20px;
    block-size: 20px;
    color: ${theme.colors.textSecondary};
  }

  > .input {
    flex: 1;
    min-inline-size: 0;
    block-size: 48px;
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    &::placeholder {
      color: ${theme.colors.textSecondary};
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  > .clear {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 48px;
    block-size: 48px;
    /* Eats the field's own end padding so the visible glyph stays close to
       the input while the tap target still reaches the 48px minimum
       (design-system.md, "Mobile first"). */
    margin-inline-end: -${theme.spacing.md};
    border-radius: ${theme.radii.pill};
    color: ${theme.colors.textSecondary};

    > .glyph {
      inline-size: 16px;
      block-size: 16px;
    }

    &:hover {
      color: ${theme.colors.text};
    }
  }
`,
);
