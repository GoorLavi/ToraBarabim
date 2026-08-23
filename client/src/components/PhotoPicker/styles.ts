import { css } from 'styled-components';

export const PhotoPicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};

  /* Poster and its help text stack on a phone and sit side by side from
     md up (rabbi-panel-copy.md, section 6). This reads the viewport
     rather than the container, matching every other breakpoint in this
     component tree; the design doc's own container-width caveat is
     explicitly not enforced here for the same reason it names. */
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
  }

  > .frame {
    position: relative;
    flex-shrink: 0;
    inline-size: 160px;
    aspect-ratio: 2 / 3;
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
