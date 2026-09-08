import { css } from 'styled-components';

import { CARD_PADDING } from '~/ContactPage/consts';

export const AddressCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
  padding: ${CARD_PADDING};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};

  > .label {
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.tagAndCaption.fontWeight};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }

  /* No role in the type scale is 20/28 at semiBold: composed from
     \`sectionHeading\`'s phone size pair (20/28), which is otherwise always
     paired with \`bold\`. */
  > .address {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    text-decoration: none;
    user-select: text;

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }

  > .spacer {
    block-size: 8px;
  }

  > .mailButton {
    inline-size: 100%;
    min-block-size: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: ${theme.spacing.xl};
    border: none;
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primary};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    text-decoration: none;

    &:hover,
    &:active {
      background: ${theme.colors.primaryStrong};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }

  > .fallback {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
