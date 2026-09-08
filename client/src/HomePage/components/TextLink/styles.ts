import { css } from 'styled-components';

// The one text-link shape used everywhere on the home page a link reaches
// its 48px target through padding rather than a bigger font
// (design-system.md, "A target is not as tall as its text").
export const TextLink = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-block: 13px;
  padding-inline: ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.primary};
  font-size: ${theme.typography.secondary.phone.fontSize};
  line-height: ${theme.typography.secondary.phone.lineHeight};
  font-weight: ${theme.typography.fontWeight.semiBold};
  text-decoration: none;
  transition: color 150ms ease, background-color 150ms ease;

  > .chevron {
    inline-size: 7px;
    block-size: 12px;
    flex-shrink: 0;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: ${theme.colors.primaryStrong};

      > .label {
        text-decoration: underline;
      }
    }
  }

  &:active {
    color: ${theme.colors.primaryStrong};
    background: ${theme.colors.primarySoft};
  }
`,
);
