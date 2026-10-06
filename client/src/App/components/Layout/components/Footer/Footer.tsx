import styled from 'styled-components';

import { TextLink } from '~/HomePage/components/TextLink/TextLink';
import { WOMEN_PAGE_PATH } from '~/hooks/consts';

import { InstallIcon } from '../InstallIcon/InstallIcon';
import * as consts from './consts';
import type { FooterProps } from './models';
import * as styles from './styles';

export const Footer = styled(({ className, installLink }: FooterProps) => (
  <footer className={className}>
    <div className="inner">
      <span className="wordmark" dir="auto">
        {consts.WORDMARK}
      </span>
      <nav className="links">
        <TextLink to="/contact">{consts.CONTACT_LABEL}</TextLink>
        <TextLink to="/cities">{consts.CITIES_LABEL}</TextLink>
        <TextLink to="/rabbis">{consts.RABBIS_LABEL}</TextLink>
        <TextLink to="/places">{consts.PLACES_LABEL}</TextLink>
        <TextLink to="/lessons">{consts.LESSONS_LABEL}</TextLink>
        <TextLink to={WOMEN_PAGE_PATH}>{consts.WOMEN_LABEL}</TextLink>
        {installLink && (
          <div className="installRow">
            <TextLink {...{ icon: <InstallIcon name="addToHomeScreen" size={18} />, onClick: installLink.onOpen }}>{installLink.label}</TextLink>
          </div>
        )}
      </nav>
    </div>
  </footer>
))`
  ${styles.Footer}
`;
