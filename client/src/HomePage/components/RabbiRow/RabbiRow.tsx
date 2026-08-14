import classNames from 'classnames';
import styled from 'styled-components';

import { RabbiAvatar } from './components/RabbiAvatar/RabbiAvatar';
import * as consts from './consts';
import { uniqueRabbis } from './helpers';
import type { RabbiRowProps } from './models';
import * as styles from './styles';

export const RabbiRow = styled(({ className, items, isLoading }: RabbiRowProps) => {
  const rabbis = items ? uniqueRabbis(items) : [];

  return (
    <section className={className}>
      <div className="heading">
        <h2>{consts.HEADING}</h2>
        <span className="seeAll">{consts.SEE_ALL_LABEL}</span>
      </div>

      {isLoading && (
        <p className={classNames('state', 'loading')} aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      )}

      {!isLoading && rabbis.length === 0 && <p className="state">{consts.EMPTY_MESSAGE}</p>}

      {!isLoading && rabbis.length > 0 && (
        <ul className="row">
          {rabbis.map((rabbi) => (
            <li key={rabbi.id}>
              <RabbiAvatar rabbi={rabbi} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
})`
  ${styles.RabbiRow}
`;
