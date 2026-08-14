import { css } from 'styled-components';

export const LessonCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  &.cancelled {
    opacity: 0.7;
  }

  > .poster {
    position: relative;
    aspect-ratio: 3 / 4;
    background: ${theme.colors.primarySoft};

    > .image {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;

      &.placeholder {
        background: ${theme.colors.primarySoft};
      }
    }

    > .medallion {
      position: absolute;
      inset-block-start: ${theme.spacing.sm};
      inset-inline-end: ${theme.spacing.sm};
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};

      > .weekday {
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        font-weight: ${theme.typography.fontWeight.regular};
      }

      > .time {
        font-size: ${theme.typography.timeInCard.phone.fontSize};
        line-height: ${theme.typography.timeInCard.phone.lineHeight};
        font-weight: ${theme.typography.timeInCard.fontWeight};
      }
    }
  }

  > .body {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};

    > .title {
      font-size: ${theme.typography.cardTitleCompact.phone.fontSize};
      line-height: ${theme.typography.cardTitleCompact.phone.lineHeight};
      font-weight: ${theme.typography.cardTitleCompact.fontWeight};
      color: ${theme.colors.text};
      overflow-wrap: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
        font-weight: ${theme.typography.cardTitle.fontWeight};
      }
    }

    > .meta {
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .audience {
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }

      > .description {
        color: ${theme.colors.textSecondary};
      }
    }

    > .city {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .cancelledBadge {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.tagAndCaption.fontWeight};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      width: fit-content;

      > .reason {
        font-weight: ${theme.typography.fontWeight.regular};
        color: ${theme.colors.textSecondary};
      }
    }

    > .substituteNote {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }
  }
`,
);
