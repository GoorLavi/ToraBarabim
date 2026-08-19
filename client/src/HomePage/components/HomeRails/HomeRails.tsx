import classNames from 'classnames';
import styled from 'styled-components';

import { LessonRail } from '../LessonRail/LessonRail';
import { RailSkeleton } from './components/RailSkeleton/RailSkeleton';
import * as consts from './consts';
import type { HomeRailsProps } from './models';
import * as styles from './styles';

export const HomeRails = styled(({ className, query }: HomeRailsProps) => {
  if (query.isError) {
    return (
      <div className={classNames(className, 'error')} role="alert">
        <p className="headline">{consts.ERROR_HEADLINE}</p>
        <p className="hint">{consts.ERROR_HINT}</p>
        <button type="button" className="retry" onClick={() => query.refetch()}>
          {consts.RETRY_LABEL}
        </button>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className={className} aria-busy="true">
        <span className="srOnly" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </span>
        {consts.SKELETON_RAIL_KEYS.map((key) => (
          <RailSkeleton key={key} />
        ))}
      </div>
    );
  }

  if (!query.data) return null;

  if (query.data.rows.length === 0) {
    return (
      <div className={classNames(className, 'empty')}>
        <p className="headline">{consts.EMPTY_HEADLINE}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {query.data.rows.map((row) => (
        <LessonRail key={row.id} title={row.title} items={row.items} />
      ))}
    </div>
  );
})`
  ${styles.HomeRails}
`;
