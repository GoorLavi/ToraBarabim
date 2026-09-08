import { css } from 'styled-components';

export const RabbiAvatar = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  inline-size: 88px;
  flex-shrink: 0;
  text-align: center;
  padding-block-end: ${theme.spacing.xs};
  border-radius: ${theme.radii.lg};
  color: inherit;
  text-decoration: none;

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
    color: ${theme.colors.text};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.fontWeight.semiBold};
    overflow-wrap: break-word;
    transition: color 150ms ease;
  }

  /* Hover only on a mouse: a touch device must never get a stuck hover
     (design spec, round 4). A ring around the photo itself was tried in
     design and rejected, since primary on the plum portrait is nearly
     invisible; the cell's own focus outline carries the signal instead. */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      > .photo {
        opacity: 0.92;
      }

      > .name {
        color: ${theme.colors.primary};
        text-decoration: underline;
      }
    }
  }

  /* Focus keeps the name in \`primary\` without an underline: the ring is
     already carrying the signal, so this is not a further step past hover. */
  &:focus-visible > .name {
    color: ${theme.colors.primary};
    text-decoration: none;
  }

  &:active {
    > .photo {
      opacity: 0.86;
    }

    > .name {
      color: ${theme.colors.primaryStrong};
      text-decoration: underline;
    }
  }
`,
);
