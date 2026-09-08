import { css } from 'styled-components';

import { CARD_PADDING } from '~/ContactPage/consts';

export const TipCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.xs};
  padding-block: ${theme.spacing.lg};
  padding-inline: ${CARD_PADDING};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.accentSoft};

  > .heading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.cardTitle.fontWeight};
    font-size: ${theme.typography.cardTitle.phone.fontSize};
    line-height: ${theme.typography.cardTitle.phone.lineHeight};
  }

  > .body {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
