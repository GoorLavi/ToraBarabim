import { css } from 'styled-components';

export const PhotoPicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.sm};

  > .preview {
    inline-size: 160px;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primarySoft};

    &.placeholder {
      background: ${theme.colors.primarySoft};
    }
  }

  > .chooseFile {
    display: flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.pill};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    cursor: pointer;

    > input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      opacity: 0;
    }
  }

  &.invalid > .preview {
    outline: 2px solid ${theme.colors.danger};
    outline-offset: 2px;
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .help {
    display: flex;
    flex-direction: column;
    gap: 2px;

    > .helpItem {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }
  }
`,
);
