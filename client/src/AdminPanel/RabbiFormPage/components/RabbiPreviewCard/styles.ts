import { css } from 'styled-components';

export const RabbiPreviewCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .label {
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }

  > .card {
    max-inline-size: 220px;
    overflow: hidden;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.card};

    > .photo {
      inline-size: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      background: ${theme.colors.primarySoft};

      &.placeholder {
        background: ${theme.colors.primarySoft};
      }
    }

    > .name {
      padding: ${theme.spacing.md};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
    }
  }
`,
);
