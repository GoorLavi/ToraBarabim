import { css } from 'styled-components';

export const ContactCta = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.primarySoft};

  > .message {
    max-inline-size: 640px;
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.xl};
    border: 1px solid ${theme.colors.primary};
    border-radius: ${theme.radii.md};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }
`,
);
