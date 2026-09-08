import { css } from 'styled-components';

// The text-link role: the 48px target comes from padding-block on the
// anchor itself, never a bigger font. The row around it carries its own
// `sm` padding on top of that, so the row reads as more than the bare
// 48px target between the plum fields above and below it on the rabbi and
// lesson pages.
export const BackLink = css(
  ({ theme }) => `
  padding-block: ${theme.spacing.sm};

  > .anchor {
    display: inline-flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    min-block-size: 48px;
    padding-block: 13px;
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    text-decoration: none;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: ${theme.colors.primaryStrong};
        text-decoration: underline;
      }
    }

    &:active {
      color: ${theme.colors.primaryStrong};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
      border-radius: ${theme.radii.sm};
    }

    > .chevron {
      inline-size: 7px;
      block-size: 12px;
      flex-shrink: 0;
    }
  }
`,
);
