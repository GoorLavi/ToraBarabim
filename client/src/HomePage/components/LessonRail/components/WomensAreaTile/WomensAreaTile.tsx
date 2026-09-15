import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CandlesEmblem } from '~/HomePage/components/CandlesEmblem/CandlesEmblem';
import { WOMEN_PAGE_PATH } from '~/hooks/consts';

import * as consts from './consts';
import type { WomensAreaTileProps } from './models';
import * as styles from './styles';

// The one non-lesson item in the first home rail: same list item, same card
// shell, so it sits in the rail at the height its neighbours set rather
// than a fixed height of its own.
export const WomensAreaTile = styled(({ className, lessonCount }: WomensAreaTileProps) => (
  <Link to={WOMEN_PAGE_PATH} className={className} aria-label={consts.tileAriaLabel(lessonCount)}>
    <div className="plum">
      <CandlesEmblem {...{ variant: 'onPlum', size: consts.EMBLEM_SIZE_PHONE }} className="emblem" />
      <p className="count" dir="ltr">
        {lessonCount}
      </p>
      <p className="countWord">{consts.tileCountWord(lessonCount)}</p>
      <p className="line">{consts.TILE_LINE}</p>
    </div>

    <div className="white">
      <h3 className="heading">{consts.TILE_HEADING}</h3>
      <span className="seeAll">
        <svg className="chevron" viewBox="0 0 7 12" fill="none" aria-hidden="true">
          <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="label">{consts.TILE_LINK_LABEL}</span>
      </span>
    </div>
  </Link>
))`
  ${styles.WomensAreaTile}
`;
