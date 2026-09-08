import { css } from 'styled-components';

import * as consts from './consts';

export const LoginPage = css(
  ({ theme }) => `
  block-size: 100%;

  > .content {
    /* A fixed block-size plus its own scroll, rather than the page growing
       past the viewport: a flex container that centres its content with
       "justify-content: center" clips the start-side overflow first and
       leaves it unreachable once it no longer fits (a very short viewport,
       or the error message adding a line). The auto margins below centre
       the group the same way while degrading to a normal, fully scrollable
       top-anchored flow instead, so nothing here can render behind or
       under the floating button below. */
    block-size: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xl};
    padding: ${theme.spacing.lg};
    padding-block-end: calc(${theme.spacing.lg} + ${consts.WHATSAPP_BUTTON_SIZE} + ${theme.spacing.xl} + env(safe-area-inset-bottom));

    @media (min-width: ${theme.breakpoints.md}) {
      padding-block-end: calc(${theme.spacing.xl} + ${consts.WHATSAPP_BUTTON_SIZE} + ${theme.spacing.xl} + env(safe-area-inset-bottom));
    }

    > .brand {
      margin-block-start: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${theme.spacing.sm};

      > .wordmark {
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.pageHeading.phone.fontSize};
        line-height: ${theme.typography.pageHeading.phone.lineHeight};
      }

      > .badge {
        padding-block: ${theme.spacing.xs};
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }

    > .card {
      inline-size: 100%;
      max-inline-size: 400px;
      padding: ${theme.spacing.xl};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};
      box-shadow: ${theme.shadows.raised};

      > .heading {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.pageHeading.fontWeight};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      }

      > .subtext {
        margin-block-start: ${theme.spacing.xs};
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .form {
        margin-block-start: ${theme.spacing.lg};
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.md};

        > .error {
          padding: ${theme.spacing.sm};
          border-radius: ${theme.radii.sm};
          background: ${theme.colors.accentSoft};
          color: ${theme.colors.danger};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }

        > .field {
          display: flex;
          flex-direction: column;
          gap: ${theme.spacing.xs};

          > .label {
            color: ${theme.colors.text};
            font-weight: ${theme.typography.fontWeight.semiBold};
            font-size: ${theme.typography.secondary.phone.fontSize};
            line-height: ${theme.typography.secondary.phone.lineHeight};
          }

          > input {
            min-block-size: 52px;
            padding-inline: ${theme.spacing.md};
            border: 1px solid ${theme.colors.border};
            border-radius: ${theme.radii.md};
            background: ${theme.colors.surface};
            color: ${theme.colors.text};
            font-size: ${theme.typography.body.phone.fontSize};
            line-height: ${theme.typography.body.phone.lineHeight};

            &:focus {
              outline: 2px solid ${theme.colors.primary};
              outline-offset: 1px;
            }
          }
        }

        > .submit {
          min-block-size: 52px;
          margin-block-start: ${theme.spacing.xs};
          border-radius: ${theme.radii.md};
          background: ${theme.colors.primary};
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};

          &:disabled {
            opacity: 0.6;
            cursor: default;
          }

          &:not(:disabled):hover {
            background: ${theme.colors.primaryStrong};
          }
        }
      }
    }

    > .forgot {
      margin-block-end: auto;
      max-inline-size: 400px;
      text-align: center;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    /* A short viewport (a real phone with its address bar showing, not just
       the accepted 320-wide edge case) can be shorter than the unwrapped
       page even after the auto margins above give up their centring: the
       content then overflows, the auto margins collapse to 0, and ".forgot"
       lands wherever top-down flow puts it, which can be under the fixed
       button before anyone scrolls. Tightening the vertical rhythm here
       keeps the unscrolled page short enough to actually fit, rather than
       reserving more end padding that only helps once already scrolled.
       This has to come after the base ".brand" / ".card" / ".forgot" rules
       above: equal-specificity selectors cascade by source order regardless
       of which one sits in a media query, so a narrower override placed
       earlier would lose to the wider rule declared later. */
    @media (max-height: 700px) {
      gap: ${theme.spacing.sm};
      padding-block-start: ${theme.spacing.sm};
      padding-block-end: calc(${theme.spacing.sm} + ${consts.WHATSAPP_BUTTON_SIZE} + ${theme.spacing.sm} + env(safe-area-inset-bottom));

      > .brand {
        gap: ${theme.spacing.xs};
      }

      > .card {
        padding: ${theme.spacing.md};

        > .subtext {
          margin-block-start: 0;
        }

        > .form {
          margin-block-start: ${theme.spacing.sm};
          gap: ${theme.spacing.xs};

          > .submit {
            margin-block-start: 0;
          }
        }
      }
    }

    /* CSS has no parent selector, so the fix for the floating button
       overlapping a focused field on a small screen (the keyboard pushing
       the submit button toward it) lives here, on the field container it
       reacts to, rather than on the button itself. Scoped to ":has(.field
       :focus-within)" rather than plain ":focus-within" so the submit
       button keeping focus after a failed login (nothing else claims it)
       does not also hide the button: only the email and password fields
       carry ".field". */
    &:has(.field:focus-within) ~ .whatsapp {
      opacity: 0;
      pointer-events: none;
    }

    @media (min-width: ${theme.breakpoints.md}) {
      &:has(.field:focus-within) ~ .whatsapp {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  > .whatsapp {
    position: fixed;
    inset-block-end: calc(${theme.spacing.lg} + env(safe-area-inset-bottom));
    inset-inline-start: ${theme.spacing.lg};
    inline-size: ${consts.WHATSAPP_BUTTON_SIZE};
    block-size: ${consts.WHATSAPP_BUTTON_SIZE};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.radii.pill};
    background: ${consts.WHATSAPP_BUTTON_COLOR};
    color: ${theme.colors.textOnPrimary};
    box-shadow: ${theme.shadows.raised};
    z-index: ${consts.WHATSAPP_BUTTON_Z_INDEX};
    transition: opacity 120ms ease, background-color 120ms ease;

    &:hover,
    &:active {
      background: ${consts.WHATSAPP_BUTTON_COLOR_HOVER};
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    > .icon {
      inline-size: calc(${consts.WHATSAPP_BUTTON_SIZE} / 2);
      block-size: calc(${consts.WHATSAPP_BUTTON_SIZE} / 2);
    }

    > .tooltip {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: calc(100% + ${theme.spacing.sm});
      transform: translateY(-50%);
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      box-shadow: ${theme.shadows.card};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease;
    }

    &:focus-visible > .tooltip {
      opacity: 1;
    }

    @media (hover: hover) {
      &:hover > .tooltip {
        opacity: 1;
      }
    }

    @media (min-width: ${theme.breakpoints.md}) {
      inset-block-end: calc(${theme.spacing.xl} + env(safe-area-inset-bottom));
      inset-inline-start: ${theme.spacing.xl};
    }
  }
`,
);
