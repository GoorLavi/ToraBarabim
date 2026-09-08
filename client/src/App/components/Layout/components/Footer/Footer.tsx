import styled from 'styled-components';

import { TextLink } from '~/HomePage/components/TextLink/TextLink';

import * as consts from './consts';
import type { FooterProps } from './models';
import * as styles from './styles';

export const Footer = styled(({ className }: FooterProps) => (
  <footer className={className}>
    <div className="inner">
      <span className="wordmark" dir="auto">
        {consts.WORDMARK}
      </span>
      <nav className="links">
        <TextLink to="/contact">{consts.CONTACT_LABEL}</TextLink>
        <TextLink to="/cities">{consts.CITIES_LABEL}</TextLink>
        <TextLink to="/rabbis">{consts.RABBIS_LABEL}</TextLink>
        <TextLink to="/lessons">{consts.LESSONS_LABEL}</TextLink>
      </nav>
    </div>
  </footer>
))`
  ${styles.Footer}
`;
