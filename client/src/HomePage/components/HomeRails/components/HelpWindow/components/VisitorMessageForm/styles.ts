import { css } from 'styled-components';

import { PrimaryButton } from '~/components/PrimaryButton/styles';

import { MESSAGE_FIELD_ROWS } from './consts';

const fieldsAndFeedback = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .field {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    /* Keeps a field clear of the sheet's own edge when focus scrolls it into
       view above a phone keyboard. */
    scroll-margin-block: ${theme.spacing.xxl};

    > .label {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    /* Seventeen pixels, the body size: smaller would make iOS zoom the page
       when the field takes focus. */
    > .control {
      inline-size: 100%;
      min-block-size: 48px;
      padding-block: ${theme.spacing.sm};
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      &::placeholder {
        color: ${theme.colors.textSecondary};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 1px;
      }

      &[aria-invalid='true'] {
        border-color: ${theme.colors.danger};
      }

      &.phone {
        text-align: end;
      }

      /* Grows with what is typed, from four rows up: the field-sizing
         rule ignores the rows attribute, so the floor is stated here. */
      &.message {
        min-block-size: calc(${MESSAGE_FIELD_ROWS} * ${theme.typography.body.phone.lineHeight} + 2 * ${theme.spacing.sm} + 2 * 1px);
        resize: vertical;
        field-sizing: content;
      }
    }

    > .error {
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .failure {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);

// The submit button is the site's primary button, so it composes that exported
// block instead of restating it: the fill, the hover and the 48px target stay
// one definition. Only the sending state is this form's own.
export const VisitorMessageForm = css`
  ${fieldsAndFeedback}

  > .submit {
    ${PrimaryButton}

    &[aria-disabled='true'] {
      opacity: 0.7;
      cursor: progress;
    }
  }
`;
