import { css } from 'styled-components';

export const GalleryField = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .header {
    display: flex;
    justify-content: flex-end;

    > .count {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
    gap: ${theme.spacing.sm};

    > .tile {
      position: relative;
      aspect-ratio: 1;
      border-radius: ${theme.radii.md};
      overflow: hidden;
      background: ${theme.colors.primarySoft};

      > .photo {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        display: block;

        &.dimmed {
          opacity: 0.5;
        }
      }

      > .remove {
        position: absolute;
        inset-block-start: ${theme.spacing.xs};
        inset-inline-end: ${theme.spacing.xs};
        inline-size: 28px;
        block-size: 28px;
        border-radius: ${theme.radii.pill};
        border: 1px solid ${theme.colors.border};
        background: ${theme.colors.surface};
        color: ${theme.colors.text};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      > .status {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${theme.spacing.xs};
        padding-inline: ${theme.spacing.xs};
        text-align: center;

        > .label {
          color: ${theme.colors.textOnPrimary};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }

        &.uploading {
          background: rgba(32, 27, 29, 0.45);
        }

        &.failed {
          background: ${theme.colors.surface};
          border: 1px solid ${theme.colors.danger};

          > .label {
            color: ${theme.colors.danger};
          }

          > .retry {
            color: ${theme.colors.primary};
            font-weight: ${theme.typography.fontWeight.semiBold};
            font-size: ${theme.typography.tagAndCaption.phone.fontSize};
            line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
            text-decoration: underline;
          }
        }
      }
    }

    > .addTile {
      aspect-ratio: 1;
      border-radius: ${theme.radii.md};
      border: 1px dashed ${theme.colors.border};
      color: ${theme.colors.primary};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: ${theme.spacing.xs};

      > .plus {
        font-size: 24px;
        line-height: 1;
      }

      > .label {
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      > .fileInput {
        display: none;
      }
    }
  }

  > .maxReachedNote {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
