import { css } from 'styled-components';

import { ICON_TO_INPUT_GAP, PADDING_INLINE } from './consts';

export const RabbiSearchField = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${ICON_TO_INPUT_GAP};
  min-block-size: 48px;
  padding-inline: ${PADDING_INLINE};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  &:focus-within {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: -${theme.spacing.sm};
  }

  > .icon {
    flex-shrink: 0;
    inline-size: 20px;
    block-size: 20px;
    color: ${theme.colors.textSecondary};
  }

  > .input {
    flex: 1;
    min-inline-size: 0;
    block-size: 48px;
    border: none;
    background: transparent;
    color: ${theme.colors.text};
    font-family: inherit;
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: ${theme.colors.textSecondary};
    }

    &::-webkit-search-cancel-button,
    &::-webkit-search-decoration {
      display: none;
    }
  }

  > .clear {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 48px;
    block-size: 48px;
    /* The drawn pill is 32x30, a target below the 48px floor
       (design-system.md, "Mobile first"). The button keeps the full 48x48
       target and centres the smaller visible pill inside it. */
    margin-inline-end: -${PADDING_INLINE};

    > .pill {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 32px;
      block-size: 30px;
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }
  }
`,
);
