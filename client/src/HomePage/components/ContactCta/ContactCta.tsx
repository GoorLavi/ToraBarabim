import { Link } from 'react-router-dom';
import styled from 'styled-components';

import * as consts from './consts';
import type { ContactCtaProps } from './models';
import * as styles from './styles';

export const ContactCta = styled(({ className }: ContactCtaProps) => (
  <section className={className}>
    <p className="message">{consts.MESSAGE}</p>
    <Link className="cta" to="/contact">
      {consts.CTA_LABEL}
    </Link>
  </section>
))`
  ${styles.ContactCta}
`;
