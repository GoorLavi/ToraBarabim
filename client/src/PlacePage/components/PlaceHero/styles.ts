import { css } from 'styled-components';

import { GOOGLE_MAPS_BUTTON_HOVER_COLOR, PHOTO_HEIGHT_DESKTOP, PHOTO_WIDTH_DESKTOP, WAZE_BUTTON_HOVER_COLOR } from './consts';

// The plum head card, radius `lg` (design spec, "Head card"): built
// no-photo-first. With no photo `.photo` never renders (PlaceHero.tsx), so
// nothing here reserves space for it; the card is exactly `.content`, its
// own padding standing in for the whole card's.
export const PlaceHero = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.primary};
  overflow: hidden;

  @media (min-width: ${theme.breakpoints.lg}) {
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing.xxl};
    padding: ${theme.spacing.xxl};
  }

  /* Full card width at its own 16:9 ratio on a phone, bleeding to the
     card's own edges (the rounded top corners come from the card's own
     \`overflow: hidden\` above); a fixed 320x180 box beside the text from
     \`lg\` (design spec, "The photo is 16:9"). */
  > .photo {
    display: block;
    inline-size: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    flex-shrink: 0;

    @media (min-width: ${theme.breakpoints.lg}) {
      inline-size: ${PHOTO_WIDTH_DESKTOP};
      block-size: ${PHOTO_HEIGHT_DESKTOP};
      aspect-ratio: auto;
      border-radius: ${theme.radii.md};
    }
  }

  > .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl};

    @media (min-width: ${theme.breakpoints.lg}) {
      flex: 1 1 auto;
      min-inline-size: 0;
      padding: 0;
    }

    > .name {
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      color: ${theme.colors.textOnPrimary};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.lg}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .address {
      inline-size: 100%;
      display: flex;
      flex-direction: column;
    }

    /* One line per address part, never concatenated (design spec,
       design-system.md "A number at a line break flips"): each line stays
       on its own row and truncates rather than wraps, the same mitigation
       LessonTicket's own \`.street\` line uses, so a long street name can
       never wrap mid-line and flip its house number either. */
    > .address > .line {
      inline-size: 100%;
      color: ${theme.colors.textOnPrimaryMuted};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > .meta {
      color: ${theme.colors.accentOnDark};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .navRow {
      inline-size: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};
    }

    > .navRow > .navButton {
      /* 160, not 140: the Google Maps label's own min-content width is
         ~152-160px (mirrors LessonTicket/styles.ts's own navButton). */
      flex: 1 1 160px;
      min-block-size: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.borderOnPrimary};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surfaceOnPrimary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      text-decoration: none;
      white-space: nowrap;

      > .icon {
        flex: 0 0 auto;
        block-size: 20px;
        inline-size: auto;

        &.waze {
          aspect-ratio: 1 / 1;
        }

        &.googleMaps {
          aspect-ratio: 256 / 367;
        }
      }

      /* A \`primary\`-colored ring is invisible against this card's own
         \`primary\` background (mirrors LessonTicket/styles.ts). */
      &:focus-visible {
        outline: 2px solid ${theme.colors.textOnPrimary};
        outline-offset: 2px;
      }

      &.waze:hover,
      &.waze:active {
        background: ${WAZE_BUTTON_HOVER_COLOR};
        border-color: ${WAZE_BUTTON_HOVER_COLOR};
      }

      &.googleMaps:hover,
      &.googleMaps:active {
        background: ${GOOGLE_MAPS_BUTTON_HOVER_COLOR};
        border-color: ${GOOGLE_MAPS_BUTTON_HOVER_COLOR};
      }
    }
  }
`,
);
