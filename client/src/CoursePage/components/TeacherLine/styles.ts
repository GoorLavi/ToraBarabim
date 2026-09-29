import { css } from 'styled-components';

export const TeacherLine = css(
  ({ theme }) => `
  display: flex;
  align-items: center;

  /* The whole row, photo and name, is the tap target (design gate round 2
     finding): a link only around the name text left a strip barely taller
     than the underline itself. */
  > .link {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    min-block-size: 48px;
    color: inherit;
    text-decoration: none;

    > .avatar {
      flex: 0 0 auto;
      inline-size: 40px;
      block-size: 40px;
      border-radius: ${theme.radii.pill};
      object-fit: cover;
      background: ${theme.colors.primarySoft};
    }

    > .name {
      color: ${theme.colors.primary};
      text-decoration: underline;
    }
  }

  > .name {
    color: ${theme.colors.text};
  }

  > .link > .name,
  > .name {
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }
`,
);
