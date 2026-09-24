import { css } from 'styled-components';

// Mirrors `RabbiViewPage/styles.ts`'s shell (breadcrumb, skeleton, header,
// fieldsGrid), plus this page's own live-preview section and danger zone.
export const DedicationViewPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    color: ${theme.colors.textSecondary};

    &.error > .message {
      color: ${theme.colors.danger};
    }

    > .retry {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }

  > .skeleton {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};

    > .skeletonHeader {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      > .skeletonLine {
        block-size: 20px;
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.border};

        &.wide {
          max-inline-size: 320px;
        }

        &.short {
          max-inline-size: 160px;
        }
      }
    }

    > .skeletonFieldsGrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: ${theme.spacing.sm};

      @media (min-width: ${theme.breakpoints.md}) {
        grid-template-columns: repeat(2, 1fr);
      }

      > .skeletonField {
        block-size: 48px;
        border-radius: ${theme.radii.md};
        background: ${theme.colors.border};
      }
    }
  }

  > .breadcrumb {
    align-self: flex-start;
    display: flex;
    align-items: center;
    min-block-size: 48px;
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    text-decoration: none;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }

  > .main {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};

    > .header {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      @media (min-width: ${theme.breakpoints.md}) {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${theme.spacing.lg};
      }

      > .identity {
        flex: 1;
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.xs};

        > .typeRow {
          display: flex;
          align-items: center;
          gap: ${theme.spacing.sm};

          > .type {
            color: ${theme.colors.textSecondary};
            font-weight: ${theme.typography.fontWeight.semiBold};
            font-size: ${theme.typography.secondary.phone.fontSize};
            line-height: ${theme.typography.secondary.phone.lineHeight};
          }
        }

        > .heading {
          overflow-wrap: break-word;
          color: ${theme.colors.text};
          font-weight: ${theme.typography.pageHeading.fontWeight};
          font-size: ${theme.typography.pageHeading.phone.fontSize};
          line-height: ${theme.typography.pageHeading.phone.lineHeight};

          @media (min-width: ${theme.breakpoints.md}) {
            font-size: ${theme.typography.pageHeading.desktop.fontSize};
            line-height: ${theme.typography.pageHeading.desktop.lineHeight};
          }
        }
      }

      > .editButton {
        flex: 0 0 auto;
        align-self: flex-start;
        display: flex;
        align-items: center;
        justify-content: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.lg};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        text-decoration: none;
      }
    }

    > .fieldsGrid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0 ${theme.spacing.sm};
      padding: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};
      box-shadow: ${theme.shadows.card};

      @media (min-width: ${theme.breakpoints.md}) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    > .previewSection {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      > .previewLabel {
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      > .previewField {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${theme.spacing.xl};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.bg};
      }
    }

    > .dangerZone {
      padding-block-start: ${theme.spacing.lg};
      border-block-start: 1px solid ${theme.colors.border};
    }
  }
`,
);
