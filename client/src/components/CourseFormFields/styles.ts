import { css } from 'styled-components';
import type { DefaultTheme } from 'styled-components';

// A `.field` recurs at three real depths in this form: a plain field
// straight under its `.section`, one of the name-and-cycle or scope rows'
// own fields (`.row > .field`), and the topic-other field nested inside the
// topic field itself (`.field > .field`). All three need the same label,
// input and helper shape, so this is interpolated at each of their own
// direct-child selectors below rather than written three times.
const fieldFragment = (theme: DefaultTheme): string => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: flex-start;

  > .label {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .input,
  > textarea.input,
  > select.input,
  > .inputAffix > .input {
    inline-size: 100%;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    font-family: inherit;
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > textarea.input {
    padding-block: ${theme.spacing.sm};
    min-block-size: 120px;
    resize: vertical;
  }

  > textarea.input.description {
    min-block-size: 208px;
  }

  > .inputAffix {
    position: relative;
    inline-size: 100%;

    > .input {
      padding-inline-end: ${theme.spacing.xxl};
    }

    > .affix {
      position: absolute;
      inset-inline-end: ${theme.spacing.md};
      inset-block: 0;
      display: flex;
      align-items: center;
      color: ${theme.colors.textSecondary};
    }
  }

  > .helper {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  /* Beside the cover it concerns, not a rejection (CourseFormFields.tsx):
     the same quiet color as .helper, since it is advice, not an error. */
  > .coverWarning {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  /* The joinable-after-opening field's own pill pair (CourseFormFields.tsx):
     only ever a child of a field, wherever that field itself sits. */
  > .pillToggle {
    display: flex;
    gap: ${theme.spacing.sm};

    > .pill {
      min-block-size: 48px;
      min-inline-size: 64px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
      }
    }
  }
`;

// Shared by both course forms (client/CLAUDE.md: never a bare HTML element,
// so a form this size, with a checkbox-like pill toggle and a textarea
// beside plain inputs, keeps every field under its own `.input` class).
export const CourseFormFields = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .section {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};

    > .sectionHeading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .row {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      > .field {
        flex: 1;
        min-inline-size: 0;
        ${fieldFragment(theme)}
      }

      @media (min-width: ${theme.breakpoints.sm}) {
        flex-direction: row;
        flex-wrap: wrap;
      }

      &.nameRow {
        flex-direction: row;

        > .field.name {
          flex: 1;
          min-inline-size: 0;
        }

        > .field.cycle {
          flex: 0 0 112px;
          inline-size: 112px;
          min-inline-size: 0;
        }
      }
    }

    > .field {
      ${fieldFragment(theme)}

      > .field {
        ${fieldFragment(theme)}
      }
    }
  }

  > .errorSummary {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.danger};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.accentSoft};

    > .heading {
      color: ${theme.colors.danger};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .list {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      padding-inline-start: ${theme.spacing.lg};
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }
`,
);
