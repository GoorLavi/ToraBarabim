import { css } from 'styled-components';

export const PickerControl = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};

  /* The full "street, city" line that used to sit under this no longer
     renders here: the locked ReadOnlyField block right below already
     itemises the same address once the place is chosen, so keeping it
     here too doubled it, at real cost in height on the panel's most-used
     form (design gate finding, PlacePicker nits). Wrapping lets a short
     inactive-place pill drop to its own line rather than eating into the
     width the name itself needs to wrap, mirroring the name rule in
     AdminPanel/PlacesListPage/components/PlaceCard/styles.ts. */
  .name {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing.xs};
    overflow-wrap: break-word;
    color: ${theme.colors.text};
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
