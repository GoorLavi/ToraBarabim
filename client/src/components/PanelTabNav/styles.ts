import { css } from 'styled-components';

// The container was `RabbiShell`'s and `AdminShell`'s own `> .nav`, moved
// here unchanged above `md`: a flex row of pill tabs, wrapped onto its own
// full-width line below the header. Below `md` it is now a fixed two-row
// grid (helpers.ts, `gridColumns`) instead of that wrap, which is what
// let five admin tabs overflow their own row before.
export const PanelTabNav = css(
  ({ theme }) => `
  display: grid;
  grid-template-columns: repeat(var(--panel-tab-columns), 1fr);
  grid-template-rows: repeat(2, 48px);
  gap: ${theme.spacing.sm};
  order: 3;
  flex-basis: 100%;

  @media (min-width: ${theme.breakpoints.md}) {
    display: flex;
    gap: ${theme.spacing.sm};
    order: 0;
    flex-basis: auto;
    margin-inline-end: auto;
  }

  > .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    min-block-size: 48px;
    /* Tighter than the desktop row's own padding (design gate round 2
       finding): a phone-width grid cell has too little room for a longer
       label ("מועדים קרובים") at the desktop padding to still fit one line. */
    padding-inline: ${theme.spacing.sm};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.surfaceOnPrimary};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    text-decoration: none;

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.lg};
    }

    &.active {
      background: ${theme.colors.surface};
      color: ${theme.colors.primary};
    }
  }
`,
);
