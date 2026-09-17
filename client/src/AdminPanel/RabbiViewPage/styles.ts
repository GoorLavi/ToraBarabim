import { css } from 'styled-components';

// Card padding `md` and gaps one stop down throughout, per design-system.md's
// "the admin panel is denser than the public site". The poster is bigger
// than `LessonViewPage`'s inline thumbnail: this page is the rabbi's own
// record, so the photo is the primary visual rather than a secondary
// identifier beside a lesson's own heading.
export const RabbiViewPage = css(
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

    > .skeletonPoster {
      inline-size: 160px;
      aspect-ratio: 3 / 4;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
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
      flex-direction: row-reverse;
      align-items: flex-start;

      > .main {
        flex: 2;
      }

      > .poster {
        flex: 1;
        position: sticky;
        inset-block-start: ${theme.spacing.lg};
      }
    }

    > .main {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      > .head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing.md};

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
          display: flex;
          align-items: center;
          justify-content: center;
          min-block-size: 48px;
          padding-inline: ${theme.spacing.lg};
          border-radius: ${theme.radii.pill};
          background: ${theme.colors.primary};
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.semiBold};
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

    > .poster {
      > .photo {
        inline-size: 100%;
        max-inline-size: 200px;
        aspect-ratio: 3 / 4;
        border-radius: ${theme.radii.sm};
        object-fit: cover;
        background: ${theme.colors.primarySoft};

        @media (min-width: ${theme.breakpoints.md}) {
          max-inline-size: 280px;
        }

        &.placeholder {
          background: ${theme.colors.primarySoft};
        }
      }
    }
  }
`,
);
