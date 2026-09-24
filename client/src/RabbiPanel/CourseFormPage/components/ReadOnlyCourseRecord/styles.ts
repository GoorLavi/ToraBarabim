import { css } from 'styled-components';

export const ReadOnlyCourseRecord = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .heading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.pageHeading.fontWeight};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  }

  > .explanation {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .closedLine {
    padding: ${theme.spacing.md};
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.text};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .cover {
    inline-size: 160px;
    aspect-ratio: 3 / 4;
    border-radius: ${theme.radii.md};
    object-fit: cover;
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

  > .dangerZone {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding-block-start: ${theme.spacing.lg};
    border-block-start: 1px solid ${theme.colors.border};

    > .heading {
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .action {
      align-self: flex-start;
      min-block-size: 48px;
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      &.delete {
        color: ${theme.colors.danger};
      }
    }
  }
`,
);
