import { css } from 'styled-components';

export const LessonViewPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.xl};
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
      gap: ${theme.spacing.md};

      > .skeletonPoster {
        flex: 0 0 auto;
        inline-size: 96px;
        aspect-ratio: 3 / 4;
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.border};
      }

      > .skeletonLines {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
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
  }

  > .layout {
    display: flex;
    flex-direction: column-reverse;
    gap: ${theme.spacing.xl};

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row;
      align-items: flex-start;

      > .main {
        flex: 2;
      }

      > .preview {
        flex: 1;
        position: sticky;
        inset-block-start: ${theme.spacing.lg};
      }
    }

    > .main {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.lg};

      > .header {
        display: flex;
        align-items: flex-start;
        gap: ${theme.spacing.md};

        > .poster {
          flex: 0 0 auto;
          inline-size: 96px;
          aspect-ratio: 3 / 4;
          border-radius: ${theme.radii.sm};
          object-fit: cover;
          background: ${theme.colors.primarySoft};

          @media (min-width: ${theme.breakpoints.md}) {
            inline-size: 140px;
          }

          &.placeholder {
            background: ${theme.colors.primarySoft};
          }
        }

        > .identity {
          flex: 1;
          min-inline-size: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing.sm};

          > .titleRow {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.spacing.sm};

            @media (min-width: ${theme.breakpoints.md}) {
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              gap: ${theme.spacing.md};
            }

            > .heading {
              flex: 1;
              min-inline-size: 0;
              overflow-wrap: break-word;
              color: ${theme.colors.text};
              font-weight: ${theme.typography.pageHeading.fontWeight};
              font-size: ${theme.typography.sectionHeading.phone.fontSize};
              line-height: ${theme.typography.sectionHeading.phone.lineHeight};

              @media (min-width: ${theme.breakpoints.md}) {
                font-size: ${theme.typography.pageHeading.phone.fontSize};
                line-height: ${theme.typography.pageHeading.phone.lineHeight};
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

              @media (min-width: ${theme.breakpoints.md}) {
                align-self: center;
              }
            }
          }

          > .rabbiLink {
            align-self: flex-start;
            display: flex;
            align-items: center;
            min-block-size: 48px;
            overflow-wrap: break-word;
            color: ${theme.colors.primary};
            font-weight: ${theme.typography.fontWeight.semiBold};
            font-size: ${theme.typography.body.phone.fontSize};
            line-height: ${theme.typography.body.phone.lineHeight};
          }

          > .rabbiUnknown {
            color: ${theme.colors.textSecondary};
            font-size: ${theme.typography.body.phone.fontSize};
            line-height: ${theme.typography.body.phone.lineHeight};
          }
        }
      }

      > .fieldsGrid {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${theme.spacing.sm};
        padding: ${theme.spacing.md};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.surface};
        box-shadow: ${theme.shadows.card};

        @media (min-width: ${theme.breakpoints.md}) {
          grid-template-columns: repeat(2, 1fr);
        }

        > .wide {
          @media (min-width: ${theme.breakpoints.md}) {
            grid-column: 1 / -1;
          }
        }
      }
    }
  }
`,
);
