import { css } from 'styled-components';

export const ReadOnlyCourseRecord = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .header {
    display: flex;
    gap: ${theme.spacing.md};

    > .cover {
      flex: 0 0 auto;
      inline-size: 96px;
      aspect-ratio: 3 / 4;
      border-radius: ${theme.radii.md};
      object-fit: cover;
    }

    > .identity {
      min-inline-size: 0;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .heading {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.pageHeading.fontWeight};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        overflow-wrap: break-word;
      }

      > .tagRow {
        display: flex;
        flex-wrap: nowrap;
        align-items: baseline;
        gap: ${theme.spacing.xs};

        > .tag {
          flex: 0 0 auto;
          padding-block: 2px;
          padding-inline: ${theme.spacing.sm};
          border-radius: ${theme.radii.sm};
          background: ${theme.colors.primary};
          color: ${theme.colors.textOnPrimary};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }

        > .closedLine {
          flex: 1 1 auto;
          min-inline-size: 0;
          color: ${theme.colors.textSecondary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }
      }
    }
  }

  > .actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    > .action {
      display: flex;
      align-items: center;
      justify-content: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.md};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      text-decoration: none;

      &.primary {
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }

      &.viewOnSite {
        border: 1px solid ${theme.colors.primary};
        color: ${theme.colors.primary};
      }
    }
  }

  > .explanation {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .fields {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
  }

  > .gallery {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
      gap: ${theme.spacing.sm};

      > .photo {
        aspect-ratio: 1;
        border-radius: ${theme.radii.md};
        object-fit: cover;
      }
    }
  }

  > .deleteAction {
    min-block-size: 48px;
    padding-block-start: ${theme.spacing.md};
    border-block-start: 1px solid ${theme.colors.border};
    text-align: start;
    color: ${theme.colors.danger};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }
`,
);
