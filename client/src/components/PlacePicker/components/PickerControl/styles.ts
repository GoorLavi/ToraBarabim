import { css } from 'styled-components';

export const PickerControl = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};

  > .field {
    position: relative;
    inline-size: 100%;

    > .control {
      inline-size: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 2px;
      min-block-size: 48px;
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      text-align: start;

      /* The full "street, city" line that used to sit under this no longer
         renders here: the locked ReadOnlyField block right below already
         itemises the same address once the place is chosen, so keeping it
         here too doubled it, ~costly height on the panel's most-used form
         (design gate finding, PlacePicker nits). \`flex-wrap: wrap\` lets a
         short inactive-place pill drop to its own line rather than eating
         into the width the name itself needs to wrap
         (mirrors AdminPanel/PlacesListPage/components/PlaceCard/styles.ts's
         own \`.name\`). */
      > .name {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${theme.spacing.xs};
        overflow-wrap: break-word;
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};

        /* \`accentSoft\`, not \`primarySoft\`: the locked fields right below
           this control use \`primarySoft\`'s quiet neutral now
           (ReadOnlyField/styles.ts's own \`.quiet\`), and a state this
           consequential (a saved lesson still pointing at a now-inactive
           place) must not share a tint with something inert. */
        > .inactiveTag {
          padding-inline: ${theme.spacing.sm};
          border-radius: ${theme.radii.pill};
          background: ${theme.colors.accentSoft};
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }
      }
    }

    > .popover {
      position: absolute;
      z-index: ${theme.zIndex.popover};
      inset-block-start: 52px;
      inset-inline-start: 0;
      inline-size: min(360px, 100%);
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};
      padding: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      box-shadow: ${theme.shadows.raised};

      > .search {
        min-block-size: 48px;
        padding-inline: ${theme.spacing.md};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.md};
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .results {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.xs};
        max-block-size: 320px;
        overflow-y: auto;

        > li > button {
          inline-size: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          min-block-size: 48px;
          padding-block: ${theme.spacing.xs};
          padding-inline: ${theme.spacing.md};
          border-radius: ${theme.radii.sm};
          text-align: start;
          color: ${theme.colors.text};

          > .name {
            font-weight: ${theme.typography.fontWeight.semiBold};
          }

          > .address {
            color: ${theme.colors.textSecondary};
            font-size: ${theme.typography.secondary.phone.fontSize};
            line-height: ${theme.typography.secondary.phone.lineHeight};
          }

          &[aria-selected='true'] {
            background: ${theme.colors.primarySoft};

            > .name {
              color: ${theme.colors.primary};
            }
          }

          &:hover {
            background: ${theme.colors.primarySoft};
          }
        }
      }
    }
  }

  /* Below the control, never inside it: an accidental tap near a 48px
     control must not both discard the choice and unlock the address
     fields. Reaches 48px through its own block padding, never line-height. */
  > .clearPlace {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    min-block-size: 48px;
    padding-block: ${theme.spacing.sm};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }
`,
);
