import { css } from 'styled-components';

// No dedicated "success"/"warning" token exists in the theme (theme/models.ts),
// so each state reuses the nearest existing color rather than inventing a
// raw value: `primary` for the one state actively serving on the home page,
// `danger` for the one state an admin pulled, `border`/`textSecondary` for
// the two calendar-driven, no-action states.
export const DedicationStateBadge = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  min-block-size: 28px;
  padding-inline: ${theme.spacing.sm};
  border-radius: ${theme.radii.pill};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.tagAndCaption.phone.fontSize};
  line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

  &.upcoming {
    background: ${theme.colors.border};
    color: ${theme.colors.textSecondary};
  }

  &.live {
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};
  }

  &.ended {
    background: ${theme.colors.border};
    color: ${theme.colors.textSecondary};
  }

  &.takenDown {
    background: ${theme.colors.accentSoft};
    color: ${theme.colors.danger};
  }
`,
);
