import { css } from 'styled-components';

// Targets `ResponsiveSheet`'s own `.panel`, the shell's public slot for a
// sheet's own content (see the comment on that component's styles.ts).
// The picker's own panel component owns its padding and its own scrolling
// region, so this resets the shell's default padding and lets `dvh` (not
// `vh`, which a mobile browser's chrome cuts into) drive the drawer's
// height instead.
export const FilterDrawer = css(
  () => `
  > .panel {
    max-block-size: 85dvh;
    padding: 0;
    gap: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`,
);
