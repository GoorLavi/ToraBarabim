import styled from 'styled-components';

import { CONTACT_EMAIL } from '~/HomePage/components/ContactCta/consts';

import * as consts from './consts';
import type { AddressCardProps } from './models';
import * as styles from './styles';

const MAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export const AddressCard = styled(({ className }: AddressCardProps) => (
  <div className={className}>
    <p className="label">{consts.ADDRESS_LABEL}</p>
    <a className="address" href={MAIL_HREF} dir="ltr">
      {CONTACT_EMAIL}
    </a>
    <div className="spacer" aria-hidden="true" />
    <a className="mailButton" href={MAIL_HREF}>
      {consts.MAIL_BUTTON_LABEL}
    </a>
    <p className="fallback">{consts.FALLBACK_NOTE}</p>
  </div>
))`
  ${styles.AddressCard}
`;
