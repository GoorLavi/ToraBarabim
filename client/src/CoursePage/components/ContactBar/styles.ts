import { css } from 'styled-components';

// Fixed to the bottom on a phone, the one place both registration actions
// live once a course is open; a static card in the page's own flow from
// `xl` (1280) up. The exact desktop placement (a side card beside the
// facts, per the frame) is pending the Figma review: this holds the same
// content and both actions correctly, without yet reproducing that
// two-column layout.
export const ContactBar = css(
  ({ theme }) => `
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  z-index: ${theme.zIndex.header};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border-block-start: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.raised};

  @media (min-width: ${theme.breakpoints.xl}) {
    position: static;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    box-shadow: ${theme.shadows.card};
  }

  > .actions {
    display: flex;
    gap: ${theme.spacing.sm};

    > .whatsapp,
    > .call {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      font-weight: ${theme.typography.fontWeight.semiBold};

      > .icon {
        inline-size: 20px;
        block-size: 20px;
      }
    }

    > .whatsapp {
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
    }

    > .call {
      border: 1px solid ${theme.colors.primary};
      color: ${theme.colors.primary};
    }
  }
`,
);
