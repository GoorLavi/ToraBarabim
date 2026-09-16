import classNames from 'classnames';
import type { ReactNode } from 'react';
import styled from 'styled-components';

import { LessonRail } from '../LessonRail/LessonRail';
import { WomensAreaBand } from '../WomensAreaBand/WomensAreaBand';
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

  const { rows, womensAreaLessonCount } = query.data;

  const rails: ReactNode[] = rows.map((row) => (
    <LessonRail
      key={row.id}
      {...{ title: row.title, items: row.items, womensAreaTileIndex: row.womensAreaTileIndex, womensAreaLessonCount }}
    />
  ));

  if (womensAreaLessonCount > 0) {
    rails.splice(
      Math.min(consts.WOMENS_AREA_BAND_SLOT, rails.length),
      0,
      <WomensAreaBand key="womens-area-band" {...{ lessonCount: womensAreaLessonCount }} />,
    );
  }

  return <div className={className}>{rails}</div>;
})`
  ${styles.HomeRails}
`;
