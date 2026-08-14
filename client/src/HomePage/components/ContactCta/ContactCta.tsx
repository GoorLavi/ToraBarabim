import styled from 'styled-components';

import * as consts from './consts';
import type { ContactCtaProps } from './models';
import * as styles from './styles';

export const ContactCta = styled(({ className }: ContactCtaProps) => (
  <section className={className}>
    <p className="message">{consts.MESSAGE}</p>
    <a className="cta" href={`mailto:${consts.CONTACT_EMAIL}`}>
      {consts.CTA_LABEL}
    </a>
  </section>
))`
  ${styles.ContactCta}
`;
