import { css } from 'styled-components';

// A horizontal row, not the public poster grid: eleven of twelve rabbis
// carry no photo today, so the name (what an admin actually scans for)
// leads and the poster is a small leading thumbnail, still fixed at the
// ratified 2:3 ratio (design-system.md, "The poster image").
export const RabbiCard = css(
  ({ theme }) => `
  display: flex;
  align-items: stretch;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  > .photo {
    flex: 0 0 auto;
    inline-size: 72px;
    aspect-ratio: 2 / 3;
    border-radius: ${theme.radii.sm};
    object-fit: cover;
    background: ${theme.colors.primarySoft};

    &.placeholder {
      background: ${theme.colors.primarySoft};
    }
  }

  > .body {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing.xs};

    > .name {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: break-word;
    }

    > .count {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .actions {
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};
      margin-block-start: ${theme.spacing.xs};

      > .edit,
      > .newLesson {
        display: flex;
        align-items: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.md};
        border-radius: ${theme.radii.pill};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .edit {
        border: 1px solid ${theme.colors.border};
        color: ${theme.colors.text};
      }

      > .newLesson {
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
      }
    }
  }
`,
);
