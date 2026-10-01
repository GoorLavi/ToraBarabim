import { css } from 'styled-components';

// The same wrap layout as `DedicationCard`: the action sits beside the body
// when there is room and drops under it when there is not.
export const MessageCard = css(
  ({ theme }) => `
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  > .body {
    flex: 1;
    min-inline-size: 220px;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${theme.spacing.sm};

      > .type {
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .status {
        display: inline-flex;
        align-items: center;
        min-block-size: 28px;
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.pill};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

        &.unhandled {
          background: ${theme.colors.accentSoft};
          color: ${theme.colors.text};
        }

        &.handled {
          background: ${theme.colors.border};
          color: ${theme.colors.textSecondary};
        }
      }
    }

    /* Shrunk to the text and held at the inline start: a Latin name or
       message (dir auto resolves it left to right) then sits at the same
       edge as the Hebrew ones instead of across the card's far side. */
    > .name {
      align-self: flex-start;
      max-inline-size: 100%;
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: anywhere;
    }

    > .contact {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: ${theme.spacing.md};

      /* The number is the one thing an admin acts on, so the link reaches 48
         through its own padding rather than a taller line. */
      > .phone {
        display: inline-flex;
        align-items: center;
        min-block-size: 48px;
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
        text-decoration: none;
      }

      > .received {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .message {
      align-self: flex-start;
      max-inline-size: min(100%, 640px);
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  }

  /* Same shape and position in both states: only the label changes. */
  > .toggle {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.pill};
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: progress;
    }
  }

  > .toggleError {
    flex-basis: 100%;
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
