import classNames from 'classnames';
import styled from 'styled-components';

import { RabbiAvatar } from './components/RabbiAvatar/RabbiAvatar';
import * as consts from './consts';
import { uniqueRabbis } from './helpers';
import type { RabbiRowProps } from './models';
import * as styles from './styles';

// A row with nothing in it renders nothing at all, heading included: this
// site never puts a heading over an empty rail (design-system.md, "Every
// data screen has three states").
export const RabbiRow = styled(({ className, items, isLoading, isError }: RabbiRowProps) => {
  const rabbis = items ? uniqueRabbis(items) : [];

  if (!isLoading && !isError && rabbis.length === 0) return null;

  return (
    <section className={className}>
      <div className="heading">
        <h2>{consts.HEADING}</h2>
        <span className="seeAll">{consts.SEE_ALL_LABEL}</span>
      </div>

      {isError && (
        <p className={classNames('state', 'error')} role="alert">
          {consts.ERROR_MESSAGE}
        </p>
      )}

      {!isError && isLoading && (
        <p className={classNames('state', 'loading')} aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      )}

      {!isError && !isLoading && (
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
