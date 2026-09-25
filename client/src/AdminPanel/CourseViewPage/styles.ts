import { css } from 'styled-components';

export const CourseViewPage = css(
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

  > .layout {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};

    > .preview {
      display: none;
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row;
      align-items: flex-start;

      > .main {
        flex: 2;
      }

      > .preview {
        display: block;
        flex: 1;
        position: sticky;
        inset-block-start: ${theme.spacing.lg};
      }
    }

    > .main {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

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

        > .titleRow {
          display: flex;
          align-items: flex-start;
          gap: ${theme.spacing.md};
          min-inline-size: 0;

          @media (min-width: ${theme.breakpoints.md}) {
            flex: 1;
          }

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
          }

          > .identity {
            flex: 1;
            min-inline-size: 0;
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing.xs};

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

              > .cycle {
                color: ${theme.colors.textSecondary};
                font-weight: ${theme.typography.fontWeight.regular};
                font-size: ${theme.typography.body.phone.fontSize};
              }
            }

            > .teacherLink,
            > .teacherUnlinked {
              align-self: flex-start;
              overflow-wrap: break-word;
              font-size: ${theme.typography.body.phone.fontSize};
              line-height: ${theme.typography.body.phone.lineHeight};
            }

            > .teacherLink {
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

            > .teacherUnlinked {
              color: ${theme.colors.textSecondary};
            }
          }
        }

        > .actions {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: ${theme.spacing.sm};

          > .action {
            display: flex;
            align-items: center;
            justify-content: center;
            min-block-size: 48px;
            padding-inline: ${theme.spacing.lg};
            border: 1px solid ${theme.colors.border};
            border-radius: ${theme.radii.pill};
            color: ${theme.colors.primary};
            font-weight: ${theme.typography.fontWeight.semiBold};
            text-decoration: none;

            &.primary {
              border: none;
              background: ${theme.colors.primary};
              color: ${theme.colors.textOnPrimary};
            }
          }
        }
      }

      > .closedExplanation {
        padding: ${theme.spacing.md};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.text};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
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

      > .photosSection {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};

        > .sectionHeading {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }

        > .photosGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          gap: ${theme.spacing.sm};

          > .photoTile {
            aspect-ratio: 1;
            border-radius: ${theme.radii.md};
            overflow: hidden;

            > .photo {
              inline-size: 100%;
              block-size: 100%;
              object-fit: cover;

              &.cover {
                outline: 2px solid ${theme.colors.primary};
                outline-offset: -2px;
              }
            }
          }
        }
      }

      > .deleteAction {
        align-self: flex-start;
        min-block-size: 48px;
        color: ${theme.colors.danger};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }
  }
`,
);
