import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { TextLink } from '~/HomePage/components/TextLink/TextLink';

import { RabbiAvatar } from './components/RabbiAvatar/RabbiAvatar';
import { RabbiAvatarSkeleton } from './components/RabbiAvatarSkeleton/RabbiAvatarSkeleton';
import * as consts from './consts';
import type { RabbiRowProps } from './models';
import * as styles from './styles';

// A row with nothing in it renders nothing at all, heading included: this
// site never puts a heading over an empty rail (design-system.md, "Every
// data screen has three states"). The server already sorts and filters
// this list, so an empty list here means the site itself has no rabbis to
// show, not that a filter matched none.
export const RabbiRow = styled(({ className, rabbis, isLoading, isError }: RabbiRowProps) => {
  if (!isLoading && !isError && (!rabbis || rabbis.length === 0)) return null;

  return (
    <section className={className}>
      <div className="heading">
        <h2>{consts.HEADING}</h2>
        <TextLink
          className="seeAll"
          to="/rabbis"
          withChevron
          onClick={() => trackEvent(MIXPANEL_EVENTS.seeAllClick, { target: 'rabbis', surface: 'home' })}
        >
          {consts.SEE_ALL_LABEL}
        </TextLink>
      </div>

      {isError && (
        <p className="error" role="alert">
          {consts.ERROR_MESSAGE}
        </p>
      )}

      {!isError && isLoading && (
        <ul className="row" aria-hidden="true">
          {consts.SKELETON_KEYS.map((key) => (
            <li key={key}>
              <RabbiAvatarSkeleton />
            </li>
          ))}
        </ul>
      )}

      {!isError && !isLoading && (
        <ul className="row">
          {(rabbis ?? []).map((rabbi, index) => (
            <li key={rabbi.id}>
              <RabbiAvatar {...{ rabbi, position: index }} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
})`
  ${styles.RabbiRow}
`;
