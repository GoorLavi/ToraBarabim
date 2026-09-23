import { css } from 'styled-components';

// Token-for-token from the shape this pill shipped with on
// `PlacesListPage/components/PlaceCard/styles.ts`'s own `.inactiveTag`.
export const InactiveTag = css(
  ({ theme }) => `
  display: inline-flex;
  align-items: center;
  padding-inline: ${theme.spacing.sm};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.primarySoft};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.semiBold};
  font-size: ${theme.typography.tagAndCaption.phone.fontSize};
  line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
`,
);
