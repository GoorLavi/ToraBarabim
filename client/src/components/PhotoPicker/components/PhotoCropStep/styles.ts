import { css } from 'styled-components';

export const PhotoCropStep = css(
  ({ theme }) => `
  position: fixed;
  inset: 0;
  z-index: ${theme.zIndex.sheetScrim};
  display: flex;
  flex-direction: column;
  background: ${theme.colors.text};

  > .header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md} ${theme.spacing.lg};

    > .title {
      flex: 1;
      text-align: center;
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .cancel,
    > .confirm {
      min-block-size: 48px;
      flex-shrink: 0;
    }
  }

  > .stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: ${theme.spacing.lg};
    min-block-size: 0;

    > .viewport {
      position: relative;
      inline-size: 100%;
      max-inline-size: 480px;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-radius: ${theme.radii.md};
      border: 1px solid ${theme.colors.borderOnPrimary};
      /* The drag and pinch gesture must never scroll the page behind this
         overlay while a finger is on it (build brief); touch-action is what
         actually stops that, not a preventDefault in the handler. */
      touch-action: none;
      cursor: grab;
      background: ${theme.colors.text};

      &:active {
        cursor: grabbing;
      }

      /* Size and position come from the drag/pinch transform computed in
         PhotoCropStep.tsx: genuinely per-instance runtime values, so they
         arrive as custom properties rather than a fixed rule here. The
         anchor below is left and top rather than the usual logical
         properties on purpose: the transform's own translate values are
         computed from pointer coordinates, which are always physical and
         ignore the page's RTL direction, so the anchor they move from has
         to be physical too or the image would drift the wrong way. */
      > .image {
        position: absolute;
        left: 0;
        top: 0;
        max-inline-size: none;
        inline-size: var(--crop-image-width);
        block-size: var(--crop-image-height);
        transform: translate(var(--crop-offset-x), var(--crop-offset-y));
        user-select: none;
        pointer-events: none;
      }
    }
  }

  > .hint {
    flex-shrink: 0;
    padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.xl};
    text-align: center;
    color: ${theme.colors.textOnPrimaryMuted};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }
`,
);
