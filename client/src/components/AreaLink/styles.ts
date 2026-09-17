import { css } from 'styled-components';

export const AreaLink = css(
  ({ theme }) => `
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  /* \`xs\`, not \`sm\`: the chevron glyph itself carries ~6.75px of empty
     bearing on its text-facing side, so \`sm\` read as a visibly looser gap
     than the same chevron beside a shorter label elsewhere on the site
     (LOCKED PLAN fix round 2, item 4). This also changes the city page and
     CityEmptyState, which share this component; that is the intended
     consistency, not a side effect. */
  gap: ${theme.spacing.xs};
  min-block-size: 48px;
  padding-inline-start: ${theme.spacing.sm};
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

  /* 20x20, not the undersized box this shipped at from CityPage: the same
     viewBox, path, stroke and round caps as \`.otherLessons\` and
     \`RabbiListRow\`, fixed as part of this lift rather than copied forward
     (the chevron note, LOCKED PLAN). */
  > .chevron {
    inline-size: 20px;
    block-size: 20px;
    flex-shrink: 0;
  }
`,
);
