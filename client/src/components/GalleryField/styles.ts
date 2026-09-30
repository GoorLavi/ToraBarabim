import { css } from 'styled-components';

export const GalleryField = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  /* The shared field fragment's own align-items flex-start
     (CourseFormFields/styles.ts) shrinks a child with no width of its own
     to its content size (design gate round 3 finding): this grid needs the
     field's full width instead. */
  align-self: stretch;

  > .header {
    display: flex;
    justify-content: flex-end;

    > .count {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
    gap: ${theme.spacing.sm};

    > .tile {
      position: relative;
      aspect-ratio: 1;
      border-radius: ${theme.radii.md};
      overflow: hidden;
      background: ${theme.colors.primarySoft};

      /* The photo itself stays visible, dimmed, rather than an opaque
         overlay hiding it (design gate round 2 finding): its own reason
         reads below the whole grid instead of fighting for room in a 94px
         square. */
      &.failed {
        border: 1px solid ${theme.colors.danger};
      }

      > .photo {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        display: block;

        &.dimmed {
          opacity: 0.5;
        }
      }

      /* A positioned sibling of the photo, not a border or box-shadow on
         the tile itself (design gate fix round, designer: that paints
         under the image element and would not show). Marks a small photo
         so the one warning below the grid can point at it. */
      > .smallRing {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 0 0 2px ${theme.colors.accent};
        pointer-events: none;
      }

      /* The tile's own 48px tap target (design gate round 3 finding: 28px
         was below the minimum), its own 28px circle drawn inside rather
         than filling the whole button, so the visual size stays as
         designed. Positioned to overlay ".retryArea" below it: a failed
         tile's whole surface is that button, so removal needs its own
         higher stacking, not just DOM order, to stay reachable. */
      > .remove {
        position: absolute;
        z-index: 1;
        inset-block-start: 0;
        inset-inline-end: 0;
        inline-size: 48px;
        block-size: 48px;
        display: flex;
        align-items: center;
        justify-content: center;

        > .removeIcon {
          inline-size: 28px;
          block-size: 28px;
          border-radius: ${theme.radii.pill};
          border: 1px solid ${theme.colors.border};
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      > .status.uploading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-inline: ${theme.spacing.xs};
        text-align: center;
        background: rgba(32, 27, 29, 0.45);

        > .label {
          color: ${theme.colors.textOnPrimary};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }
      }

      /* The whole tile is the retry tap target (design gate round 3
         finding), its own pill drawn at the bottom as the button's label
         rather than a second, smaller button inside it; ".remove" above
         stays reachable through its own higher stacking (design gate round
         4 finding: carving out its own corner needed two raw pixel values
         neither on the token scale, for no visible difference). */
      > .retryArea {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-block-end: ${theme.spacing.sm};
        padding-inline: ${theme.spacing.xs};
        border: 0;
        background: none;

        /* Quiet, the same as PhotoPicker's own "החלפת תמונה" pill
           (styles.ts, ".chooseFile"): red stays on the tile's own border
           and on the reason line below the grid, not repeated here too
           (design gate round 3 finding). */
        > .retryPill {
          padding-block: ${theme.spacing.xs};
          padding-inline: ${theme.spacing.lg};
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.radii.pill};
          background: ${theme.colors.surface};
          color: ${theme.colors.primary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }
      }
    }

    > .addTile {
      aspect-ratio: 1;
      border-radius: ${theme.radii.md};
      border: 1px dashed ${theme.colors.border};
      color: ${theme.colors.primary};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: ${theme.spacing.xs};

      > .plus {
        font-size: 24px;
        line-height: 1;
      }

      > .label {
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      > .fileInput {
        display: none;
      }
    }
  }

  > .maxReachedNote {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  /* Secondary, not secondaryCompact (design gate fix round, designer: 14/20
     measured smaller than the help line and the failure reason around it,
     both secondary at 15/22; secondaryCompact keeps its own lesson-card
     meaning, no new role added here). Normal text color, not the help
     color: a warning, not a rejection like ".error" above it, and not the
     field's own quieter help line below it (CourseFormFields.tsx). */
  > .warning {
    color: ${theme.colors.text};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
