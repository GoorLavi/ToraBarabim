import { css } from 'styled-components';

import { BULLET_GAP } from './consts';

export const ContactPage = css(
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

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
      padding-block-end: ${theme.spacing.xxxl};
    }

    > .column {
      max-inline-size: 640px;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xl};

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

      > .lead {
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .whenToWrite {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};

        /* Stays 20/28 on desktop rather than stepping to the usual 24/32
           (05-lessons.md and 06-contact.md both measure this against a
           640px column, the one page in this round where the section
           heading does not step up). */
        > .heading {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.sectionHeading.fontWeight};
          font-size: ${theme.typography.sectionHeading.phone.fontSize};
          line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        }

        > .bullets {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing.sm};

          > .bullet {
            display: flex;
            align-items: flex-start;
            gap: ${BULLET_GAP};
            color: ${theme.colors.text};
            font-size: ${theme.typography.body.phone.fontSize};
            line-height: ${theme.typography.body.phone.lineHeight};

            > .dot {
              flex-shrink: 0;
              inline-size: 6px;
              block-size: 6px;
              margin-block-start: ${BULLET_GAP};
              border-radius: ${theme.radii.pill};
              background: ${theme.colors.primary};
            }
          }
        }
      }

      > .limit {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
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
