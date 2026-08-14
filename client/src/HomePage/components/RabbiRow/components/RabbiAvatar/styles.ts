import { css } from 'styled-components';

export const RabbiAvatar = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  inline-size: 88px;
  flex-shrink: 0;
  text-align: center;

  > .photo {
    inline-size: 72px;
    block-size: 72px;
    border-radius: ${theme.radii.pill};
    object-fit: cover;

    &.placeholder {
      background: ${theme.colors.primarySoft};
    }
  }

  > .name {
    color: ${theme.colors.text};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    font-weight: ${theme.typography.fontWeight.semiBold};
    overflow-wrap: break-word;
  }
`,
);
