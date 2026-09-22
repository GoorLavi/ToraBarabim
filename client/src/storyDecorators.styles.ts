import { css } from 'styled-components';

// Mirrors `PlacePanel/components/PlaceShell/styles.ts` and
// `AdminPanel/components/AdminShell/styles.ts`'s own `.content` block,
// identical in both: the gutter a panel or admin page owns nowhere itself,
// since the shell supplies it in the running app and no story mounts the
// shell around its page (design gate finding, on `layout: 'fullscreen'`
// alone leaving those pages gutterless and clipped at the inline start).
export const PanelShellContent = css(
  ({ theme }) => `
  max-inline-size: 1120px;
  inline-size: 100%;
  margin-inline: auto;
  padding-inline: ${theme.spacing.lg};
  padding-block: ${theme.spacing.xl};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
  }
`,
);
