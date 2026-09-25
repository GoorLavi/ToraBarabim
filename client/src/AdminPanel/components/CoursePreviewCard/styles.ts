import { css } from 'styled-components';

export const CoursePreviewCard = css(
  ({ theme }) => `
  position: sticky;
  inset-block-start: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .heading {
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }

  > .card {
    max-inline-size: 280px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.card};

    > .poster {
      position: relative;
      aspect-ratio: 3 / 4;
      background: ${theme.colors.primarySoft};

      > .image {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    }

    > .body {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      padding: ${theme.spacing.md};

      > .title {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
      }

      > .teacher,
      > .opening,
      > .meta {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }
  }
`,
);
