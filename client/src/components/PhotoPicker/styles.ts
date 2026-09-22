import { css } from 'styled-components';

import * as consts from './consts';

export const PhotoPicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};

  /* The 3:4 poster and its help text stack on a phone and sit side by side
     from md up (rabbi-panel-copy.md, section 6): scoped to \`.ratio3x4\`
     only, since the frame stays a small, fixed 160x213 box that has room
     beside its own text there. This reads the viewport rather than the
     container, matching every other breakpoint in this component tree; the
     design doc's own container-width caveat is explicitly not enforced
     here for the same reason it names. */
  &.ratio3x4 {
    @media (min-width: ${theme.breakpoints.md}) {
      flex-direction: row;
      align-items: flex-start;
      gap: ${theme.spacing.lg};
    }
  }

  &.ratio3x4 > .frame {
    inline-size: ${consts.PHOTO_PICKER_3X4_FRAME_WIDTH}px;
    aspect-ratio: 3 / 4;
  }

  /* Matches the frame above it exactly, rather than the generic 220px cap
     below: at the frame's own 160px that column previously ran narrower
     than the frame and left a ragged edge (design gate nits). */
  &.ratio3x4 > .details > .progress {
    inline-size: ${consts.PHOTO_PICKER_3X4_FRAME_WIDTH}px;
    max-inline-size: ${consts.PHOTO_PICKER_3X4_FRAME_WIDTH}px;
  }

  /* Takes the form's own field width, as a rule rather than a number, so
     it is always exactly as wide as the text inputs beside it and never
     drifts from them (design gate: the earlier fixed 240px was only 70%
     of the shipped hero photo's own 343px width, and visibly sat as a
     shrunken indent in a column of full-width fields). Stays stacked with
     its own help text at every width, unlike '3:4' above: a field-width
     frame never has room beside anything. The component's own root also
     takes its parent's full width here: a percentage width on \`.frame\`
     alone would resolve against an auto-sized parent wherever the caller's
     field does not already stretch its children (AdminPanel/PlaceFormPage's
     own \`.field\`, unlike PlacePanel/ProfilePage's), which computes to 0
     rather than the field's real width. */
  &.ratio16x9 {
    inline-size: 100%;
  }

  &.ratio16x9 > .frame {
    inline-size: 100%;
    /* Without a ceiling this takes the field's own width, which at the
       profile form's 776px field column renders 776 by 437: more than twice
       the 320 the photo actually ships at in the hero, and tall enough to
       push every field below it off the first screen at 1280 (design gate
       finding B2). Bigger than the shipped 320 so the photo still reads as a
       real preview, small enough that the fields stay above the fold. */
    max-inline-size: ${consts.PHOTO_PICKER_16X9_FRAME_MAX_WIDTH}px;
    aspect-ratio: 16 / 9;
  }

  > .frame {
    position: relative;
    flex-shrink: 0;
    border-radius: ${theme.radii.md};
    overflow: hidden;
    background: ${theme.colors.primarySoft};

    > .preview {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;

      &.placeholder {
        background: ${theme.colors.primarySoft};
      }

      &.dimmed {
        opacity: 0.5;
      }
    }
  }

  > .details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    min-inline-size: 0;

    > .progress {
      inline-size: 100%;
      max-inline-size: 220px;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .bar {
        block-size: 6px;
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.border};
        overflow: hidden;

        > span {
          display: block;
          inline-size: 60%;
          block-size: 100%;
          background: ${theme.colors.primary};
        }
      }

      > .status {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .failure {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: ${theme.spacing.sm};

      > .error {
        color: ${theme.colors.danger};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .retry {
        display: flex;
        align-items: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.lg};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }

      /* The chooseFile outline (design gate nits): the one escape hatch from
         a failed upload is the same "pick a file" affordance as every other
         state, so it reads as a button rather than a caption under one. */
      > .chooseOther {
        position: relative;
        display: flex;
        align-items: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.lg};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        cursor: pointer;

        > input {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          opacity: 0;
        }
      }
    }

    > .chooseFile {
      position: relative;
      display: flex;
      align-items: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      cursor: pointer;

      &.primary {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }

      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }

      > input {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        overflow: hidden;
        opacity: 0;
      }
    }

    > .error {
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .missingNote {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .help {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      > .helpItem {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }
  }

  &.invalid > .frame {
    outline: 2px solid ${theme.colors.danger};
    outline-offset: 2px;
  }
`,
);
