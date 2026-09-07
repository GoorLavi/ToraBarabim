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

  /* The pill, not the native input, is what a reader perceives as the field,
     so the focus ring is drawn on the container instead of letting Chrome
     draw its own square-cornered ring inside a rounded box. The offset is
     negative, pulling the ring onto the white pill rather than out onto the
     header band: the band is painted this same primary token in every theme,
     so a ring drawn outside the pill would sit on a background of its own
     colour and vanish. */
  &:focus-within {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: -${theme.spacing.sm};
  }

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
    border: none;
    background: transparent;
    color: ${theme.colors.text};
    font-family: inherit;
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    &:focus {
      outline: none;
    }

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
