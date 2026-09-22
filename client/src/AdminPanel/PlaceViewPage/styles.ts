import { css } from 'styled-components';

// Card padding `md` and gaps one stop down throughout, per design-system.md's
// "the admin panel is denser than the public site". Mirrors
// `RabbiViewPage/styles.ts`'s header shape, with the poster at 16:9 (a
// place's own photo ratio) instead of 3:4.
export const PlaceViewPage = css(
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
        inline-size: 120px;
        aspect-ratio: 16 / 9;
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

  > .main {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    /* No order property anywhere in this header: the edit button is a
       sibling of the poster+identity group in both the DOM and the CSS, so
       visual order always matches DOM order at every width.

       Neither the title row nor the header grows the row past its content at
       the md breakpoint and up: an earlier version gave the title row a flex
       grow of 1 and gave the header a space-between justify-content, which
       stretched the identity block to the full remaining band width and then
       pinned the button to the far end of it, 634px from the name it edits
       at 1280 (design gate finding F4). The title row keeps its default
       shrink-to-content flex value, so it only takes the width its content
       needs and only shrinks, through the identity block's own flex grow of
       1 and zeroed minimum inline size, once a long place name and the
       button together no longer fit the band. */
    > .header {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      @media (min-width: ${theme.breakpoints.md}) {
        flex-direction: row;
        align-items: flex-start;
        gap: ${theme.spacing.lg};
      }

      > .titleRow {
        display: flex;
        align-items: flex-start;
        gap: ${theme.spacing.md};
        min-inline-size: 0;

        > .poster {
          flex: 0 0 auto;
          inline-size: 120px;
          aspect-ratio: 16 / 9;
          border-radius: ${theme.radii.sm};
          object-fit: cover;
          /* The same soft fill whether the photo is missing or merely failed to
             load, so a broken URL degrades exactly like no photo at all. */
          background: ${theme.colors.primarySoft};
        }

        > .identity {
          flex: 1;
          min-inline-size: 0;
          display: flex;
          flex-direction: column;
          /* Without this the flex column's default stretch makes the shared
             InactiveTag fill the column's width, so the pill reads as a bar
             with its label pushed to one end instead of hugging it the way
             it does inside PlaceCard's inline heading element (design gate
             finding B1). */
          align-items: flex-start;
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
      /* Row-gap 0: each row already carries its own block padding and top
         hairline (RecordField/styles.ts), so an extra grid gap would double
         the space between rows. Column-gap keeps the two side-by-side
         fields from touching at md and up. */
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
`,
);
