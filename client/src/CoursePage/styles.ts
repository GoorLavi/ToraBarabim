import { css } from 'styled-components';

// A rough approximation of the sticky header's own rendered height, pending
// the frame: the side card's sticky offset only has to clear it, and being
// a few pixels off costs nothing but a slightly early or late stick.
const HEADER_HEIGHT_APPROXIMATION_PX = 88;

// Clears the fixed `ContactBar`/`ClosedPanel` bottom bar below `lg`, so the
// page's own last section is never hidden behind it: the bar's own content
// block-size (48px action row plus its padding) rounded up with headroom,
// not a spacing-scale value.
const FIXED_BAR_CLEARANCE_PX = 96;

// Single column below `lg` (1024), the fixed `ContactBar` bottom bar the
// only phone-specific chrome; two columns from `lg` up, the site's own
// content band (design brief A, items 1 to 4).
export const CoursePage = css(
  ({ theme }) => `
  max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
  inline-size: 100%;
  margin-inline: auto;
  padding-inline: ${theme.spacing.lg};
  padding-block-start: ${theme.spacing.lg};
  padding-block-end: ${FIXED_BAR_CLEARANCE_PX}px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding-block-start: ${theme.spacing.xl};
    padding-block-end: ${theme.spacing.section};
  }

  > .layout {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xxl};

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row;
      align-items: flex-start;
      gap: ${theme.spacing.xxxl};
    }

    > .storyColumn {
      min-inline-size: 0;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xxl};

      @media (min-width: ${theme.breakpoints.lg}) {
        flex: 1 1 auto;
      }

      > .heading {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};

        > .tags {
          display: flex;
          gap: ${theme.spacing.sm};

          > .tag {
            display: inline-flex;
            align-items: center;
            padding-block: 2px;
            padding-inline: ${theme.spacing.xs};
            border-radius: ${theme.radii.sm};
            font-weight: ${theme.typography.tagAndCaption.fontWeight};
            font-size: ${theme.typography.tagAndCaption.phone.fontSize};
            line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
          }

          > .topicTag {
            background: ${theme.colors.primarySoft};
            color: ${theme.colors.primary};
          }

          > .cycleTag {
            border: 1px solid ${theme.colors.border};
            background: ${theme.colors.surface};
            color: ${theme.colors.text};
          }
        }

        > .title {
          font-size: ${theme.typography.pageHeading.phone.fontSize};
          line-height: ${theme.typography.pageHeading.phone.lineHeight};
          font-weight: ${theme.typography.pageHeading.fontWeight};
          color: ${theme.colors.text};

          @media (min-width: ${theme.breakpoints.md}) {
            font-size: ${theme.typography.pageHeading.desktop.fontSize};
            line-height: ${theme.typography.pageHeading.desktop.lineHeight};
          }
        }
      }

      > .about {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};
        max-inline-size: 640px;

        > .aboutHeading {
          font-size: ${theme.typography.sectionHeading.phone.fontSize};
          line-height: ${theme.typography.sectionHeading.phone.lineHeight};
          font-weight: ${theme.typography.sectionHeading.fontWeight};
          color: ${theme.colors.text};

          @media (min-width: ${theme.breakpoints.md}) {
            font-size: ${theme.typography.sectionHeading.desktop.fontSize};
            line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
          }
        }

        > .description {
          color: ${theme.colors.text};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
          white-space: pre-line;
        }
      }

      /* Right under the name on a single column; hidden from lg up, where
         the side card's own copy (below) takes over (design brief A, item
         15). */
      > .closedNearTop {
        @media (min-width: ${theme.breakpoints.lg}) {
          display: none;
        }
      }
    }

    > .sideCard {
      display: flex;
      flex-direction: column;

      @media (min-width: ${theme.breakpoints.lg}) {
        flex: 0 0 360px;
        gap: ${theme.spacing.lg};
        padding: ${theme.spacing.xl};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.surface};
        box-shadow: ${theme.shadows.raised};
        position: sticky;
        inset-block-start: calc(${HEADER_HEIGHT_APPROXIMATION_PX}px + ${theme.spacing.xl});
      }

      /* Only relevant from lg up, where this is the side card's own closed
         panel; hidden below it, where closedNearTop above already shows
         one. */
      > .closedInCard {
        display: none;

        @media (min-width: ${theme.breakpoints.lg}) {
          display: flex;
          border-radius: ${theme.radii.md};
        }
      }
    }
  }
`,
);
