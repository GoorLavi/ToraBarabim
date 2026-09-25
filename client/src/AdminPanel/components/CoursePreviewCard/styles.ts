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

      /* The same two-line seal the public CourseCard draws
         (components/CourseCard/styles.ts), not a faded admin-only tag. */
      > .stateTag {
        position: absolute;
        inset-block-start: ${theme.spacing.sm};
        inset-inline-end: ${theme.spacing.sm};
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-block: ${theme.spacing.xs};
        padding-inline: ${theme.spacing.sm};
        border: 1px solid ${theme.colors.accentOnDark};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};

        > .small {
          font-weight: ${theme.typography.fontWeight.regular};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }

        > .big {
          font-weight: ${theme.typography.fontWeight.bold};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }

        &.closed > .rule {
          inline-size: 100%;
          block-size: 1px;
          margin-block: 2px;
          background: ${theme.colors.accentOnDark};
        }
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
