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

    /* The public preview is a desktop-only aside by design, not a layout
       accident: the approved frames carry it at the inline end from lg up and
       omit it from the 390 frame entirely. On a phone the admin came to read
       the record, and a ~470px marketing card ahead of it pushes the lesson's
       own heading and its one action below the fold. */
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

      /* No order property anywhere in this header: the edit button is a
         sibling of the poster+identity group in both the DOM and the CSS, so
         visual order always matches DOM order at every width. */
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
            }

            > .rabbiLink,
            > .rabbiUnknown {
              align-self: flex-start;
              overflow-wrap: break-word;
              font-size: ${theme.typography.body.phone.fontSize};
              line-height: ${theme.typography.body.phone.lineHeight};
            }

            > .rabbiLink {
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

            > .rabbiUnknown {
              color: ${theme.colors.textSecondary};
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
        // Row-gap 0: each row already carries its own block padding and top
        // hairline (RecordField/styles.ts), so an extra grid gap would
        // double the space between rows. Column-gap keeps the two
        // side-by-side fields from touching at md and up.
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
    }
  }
`,
);
