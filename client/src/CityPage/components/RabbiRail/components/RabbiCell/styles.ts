import { css } from 'styled-components';

// Name text matches tagAndCaption exactly (14/20 at weight 600), the one
// role in the scale this size and weight already belongs to.
export const RabbiCell = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  inline-size: 88px;
  flex-shrink: 0;
  padding-block-end: ${theme.spacing.xs};
  text-align: center;
  text-decoration: none;
  color: inherit;
  border-radius: ${theme.radii.lg};
  transition: color 150ms ease;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  > .photo {
    inline-size: 64px;
    block-size: 64px;
    border-radius: ${theme.radii.pill};
    object-fit: cover;
    transition: opacity 150ms ease;

    &.placeholder {
      background: ${theme.colors.primarySoft};
    }
  }

  > .name {
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};
    color: ${theme.colors.text};
    overflow-wrap: break-word;
    transition: color 150ms ease;
  }

  /* Rest, hover, keyboard focus and pressed each measured off the state
     board (design spec, "The four states"): focus keeps the name in
     primary without an underline, since the ring already carries that
     signal, which is the one place these four states are not a simple
     progression. */
  @media (hover: hover) and (pointer: fine) {
    &:hover > .name {
      color: ${theme.colors.primary};
      text-decoration: underline;
    }

    &:hover > .photo {
      opacity: 0.92;
    }
  }

  &:focus-visible > .name {
    color: ${theme.colors.primary};
  }

  &:active > .name {
    color: ${theme.colors.primaryStrong};
    text-decoration: underline;
  }

  &:active > .photo {
    opacity: 0.86;
  }
`,
);
