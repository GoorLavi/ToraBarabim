import { css } from 'styled-components';

export const PhotoCropStep = css(
  ({ theme }) => `
  position: fixed;
  inset: 0;
  z-index: ${theme.zIndex.sheetScrim};
  display: flex;
  flex-direction: column;
  /* Only the stage below paints dark; the chrome above and below it sits on
     a real surface (design gate F1/F8: the previous single dark field, plus
     text painted in the on-primary tokens over it, put the two header
     actions at 1:1 contrast against their own background). */
  background: ${theme.colors.surface};
  touch-action: none;

  > .header {
    flex-shrink: 0;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    border-block-end: 1px solid ${theme.colors.border};
    display: flex;
    align-items: center;
    justify-content: center;

    > .title {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }
  }

  > .stage {
    position: relative;
    flex: 1;
    min-block-size: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.xl};
    background: ${theme.colors.text};
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    /* Sized in script from the stage's own measured content box
       (PhotoCropStep.tsx, helpers.ts's windowSizeForStage), so it arrives as
       custom properties the same way the image's own size and offset do
       below. */
    > .window {
      position: relative;
      inline-size: var(--crop-window-width);
      block-size: var(--crop-window-height);
      border-radius: ${theme.radii.md};
      border: 1px solid ${theme.colors.borderOnPrimary};
      /* Paints the stage outside this box, right up to the stage's own
         clipped edge, rather than hiding it: the source photo stays visible
         and dimmed there instead of vanishing behind flat black (design gate
         F3/F4). The stage's own overflow: hidden is what stops this from
         spreading onto the header or the footer. */
      box-shadow: 0 0 0 9999px ${theme.colors.scrim};

      /* Deliberately not clipped here (overflow stays visible): the photo
         below is sized and positioned in window-local coordinates exactly as
         before, but is now free to spill into the surrounding stage instead
         of being cut at this box's own edge, which is what lets the parts a
         crop would discard stay visible, dimmed, rather than disappearing
         with no trace (design gate F3/F4). The anchor below is left and top
         rather than the usual logical properties on purpose: the transform's
         own translate values are computed from pointer coordinates, which
         are always physical and ignore the page's RTL direction, so the
         anchor they move from has to be physical too or the image would
         drift the wrong way. */
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

  > .footer {
    flex-shrink: 0;
    padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.xl};
    border-block-start: 1px solid ${theme.colors.border};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    > .hint {
      text-align: center;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }

    > .actions {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      /* The house pattern for a two-action overlay (AdminPanel/LessonFormPage's
         DiscardChangesSheet): a pair of full-width 48px buttons, the action
         that keeps the person's framing filled and dominant, the one that
         discards it a bordered ghost, so the two are never mistaken for each
         other (design gate F2). Bordered in the neutral treatment this
         component's own retry and choose-other buttons already use one level
         up (../../styles.ts), not the danger-red DiscardChangesSheet reserves
         for actually discarding saved work: choosing a different photo here
         has nothing saved to lose. */
      > .cancel {
        min-block-size: 48px;
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.md};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .confirm {
        min-block-size: 48px;
        border-radius: ${theme.radii.md};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &:disabled {
          opacity: 0.6;
        }
      }
    }
  }
`,
);
