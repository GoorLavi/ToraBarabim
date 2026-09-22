import { css } from 'styled-components';

// Token-for-token from the `.field` block that used to hold this markup in
// RabbiPanel/ProfilePage, the shape's original source.
export const ReadOnlyField = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};

  > .label {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .value {
    min-block-size: 48px;
    display: flex;
    align-items: center;
    padding-inline: ${theme.spacing.md};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  /* A locked value reads quieter than an editable field, not louder
     (design gate finding, PlacePicker nits): a neutral, untinted fill
     instead of \`primarySoft\`, which elsewhere on the same screen marks
     something that does need attention (PickerControl/styles.ts's own
     \`.inactiveTag\`). */
  &.quiet > .value {
    background: ${theme.colors.bg};
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.regular};
  }

  > .helper {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
