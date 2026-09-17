import { css } from 'styled-components';

const PHOTO_SIZE = '64px';

// A real name wraps to two lines at this cell width often enough that the
// loaded row is always as tall as its tallest cell (measured: 96px for a
// one-line name, 116px for two). The cell therefore reserves the two-line
// height even though the placeholder bar is one line, or the row grows by
// a line the moment the names arrive, which is the jump this skeleton
// exists to prevent.
export const RabbiAvatarSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  inline-size: 88px;
  flex-shrink: 0;
  padding-block-end: ${theme.spacing.xs};
  min-block-size: calc(${PHOTO_SIZE} + ${theme.spacing.sm} + ${theme.typography.tagAndCaption.phone.lineHeight} * 2 + ${theme.spacing.xs});

  > .photo {
    inline-size: ${PHOTO_SIZE};
    block-size: ${PHOTO_SIZE};
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.primarySoft};
  }

  > .name {
    inline-size: 56px;
    block-size: ${theme.typography.tagAndCaption.phone.lineHeight};
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};
  }
`,
);
