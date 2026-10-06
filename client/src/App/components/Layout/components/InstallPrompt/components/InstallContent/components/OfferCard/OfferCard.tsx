import styled from 'styled-components';

import { LogoMark } from '~/components/LogoMark/LogoMark';
import { PrimaryButton } from '~/components/PrimaryButton/PrimaryButton';
import { QuietButton } from '~/components/QuietButton/QuietButton';

import * as consts from '../../consts';
import type { OfferCardProps } from './models';
import * as styles from './styles';

export const OfferCard = styled(({ className, isComputer, onAccept, onDismiss }: OfferCardProps) => (
  <div className={className}>
    <div className="intro">
      <span className="appIcon">
        <LogoMark size={30} variant="onDark" />
      </span>
      <div className="text">
        <p className="headline">{consts.OFFER_HEADLINE}</p>
        <p className="line">{isComputer ? consts.COMPUTER_OFFER_LINE : consts.PHONE_OFFER_LINE}</p>
      </div>
    </div>
    <div className="actions">
      <PrimaryButton
        {...{
          className: 'accept',
          label: isComputer ? consts.COMPUTER_OFFER_ACCEPT_LABEL : consts.PHONE_OFFER_ACCEPT_LABEL,
          onClick: onAccept,
        }}
      />
      <QuietButton {...{ className: 'dismiss', label: consts.OFFER_DISMISS_LABEL, onClick: onDismiss }} />
    </div>
  </div>
))`
  ${styles.OfferCard}
`;
