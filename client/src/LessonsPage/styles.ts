import { css } from 'styled-components';

// This page's own block-to-block gap and title-block gap: 20px and 2px,
// neither of which matches a spacing token (the scale is
// 4/8/12/16/24/32/48/64). Measured off the frame as drawn rather than
// flattened to the nearest token (05-lessons.md, "the content column").
const CONTENT_GAP = '20px';
const TITLE_BLOCK_GAP = '2px';

export const LessonsPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .content {
    /* The band caps at theme.layout.contentMaxWidth (1280) and centres from
       1328px up: a 1280px band plus the 24px gutter on both sides is 1328px,
       so that is the container's own max width, not 1280
       (design-system.md, "Breakpoints and content width"). */
    max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};
    padding-block: ${theme.spacing.xl} ${theme.spacing.xxl};
    display: flex;
    flex-direction: column;
    gap: ${CONTENT_GAP};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
      padding-block-end: ${theme.spacing.xxxl};
      gap: ${theme.spacing.xl};
    }

    > .titleBlock {
      display: flex;
      flex-direction: column;
      gap: ${TITLE_BLOCK_GAP};
    }

    > .title {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .subtitle {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .dayHeading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    /* Full width on a phone, a fixed 240 at the row's inline end from
       \`md\` up (05-lessons.md: "the phone puts it full width and desktop
       puts it at the inline end"). */
    > .loadMore {
      align-self: stretch;

      @media (min-width: ${theme.breakpoints.md}) {
        align-self: flex-end;
        inline-size: 240px;
      }
    }
  }

  > .footer {
    max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }
  }
`,
);
