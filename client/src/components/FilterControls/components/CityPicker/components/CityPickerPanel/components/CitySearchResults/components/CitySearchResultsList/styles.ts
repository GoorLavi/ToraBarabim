import { css } from 'styled-components';

export const CitySearchResultsList = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  transition: opacity 120ms ease-out;

  &.fetching {
    opacity: 0.6;
  }

  > li > .row {
    inline-size: 100%;
    min-block-size: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing.xs};
    padding-inline: ${theme.spacing.sm};
    border-radius: ${theme.radii.sm};
    text-align: start;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: ${theme.colors.primarySoft};
      }
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

    > .meta {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }
  }
`,
);
