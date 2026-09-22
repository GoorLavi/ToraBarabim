import { css } from 'styled-components';

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
    inline-size: 160px;
    aspect-ratio: 3 / 4;
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

      > .chooseOther {
        position: relative;
        display: flex;
        align-items: center;
        min-block-size: 48px;
        color: ${theme.colors.textSecondary};
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
      gap: 2px;

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
