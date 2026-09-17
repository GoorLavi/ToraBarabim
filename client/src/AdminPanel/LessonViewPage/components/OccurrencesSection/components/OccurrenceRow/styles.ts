import { css } from 'styled-components';

export const OccurrenceRow = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  > .top {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .dateTime {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: ${theme.spacing.sm};

      > .date {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .time {
        color: ${theme.colors.accent};
        font-weight: ${theme.typography.timeInCard.fontWeight};
        font-size: ${theme.typography.timeInCard.phone.fontSize};
        line-height: ${theme.typography.timeInCard.phone.lineHeight};

        &.struck {
          color: ${theme.colors.textSecondary};
          text-decoration: line-through;
        }
      }
    }

    > .place {
      overflow-wrap: break-word;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .tags {
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing.xs};

      /* One chip for all three tag texts, cancelled included: the
         cancelled tag used to sit at a near-white step while the moved and
         place-changed tags carried full accentSoft, so the one state that
         matters most read weakest. primarySoft rather than accentSoft,
         which the exceptions-unavailable banner already owns below, so one
         token does not carry two meanings on one screen. */
      > .tag {
        padding-block: 2px;
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }

    /* Body, not Secondary: the reason is the only human-written sentence
       on the row, and at Secondary it read as one more grey caption,
       merging with the venue line above it. */
    > .reason {
      overflow-wrap: break-word;
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }
  }

  &.cancelled > .top > .dateTime > .date {
    color: ${theme.colors.textSecondary};
  }

  > .actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    /* Hugs the frame's own 162px rather than stretching to fill the row:
       at a wide viewport a flex-grow button spans hundreds of pixels with
       its label floating in the middle, and a lone Restore on an
       otherwise-empty row spans the whole card. */
    > .action {
      flex: 0 0 auto;
      inline-size: 162px;
      max-inline-size: 100%;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      /* A real disabled treatment, not a dimmed version of the enabled
         button: text and border step to the secondary and border tokens,
         so the state reads before the tap rather than only afterward from
         the section's own banner. */
      &:disabled {
        color: ${theme.colors.textSecondary};
        border-color: ${theme.colors.border};
        cursor: not-allowed;
      }
    }
  }
`,
);
