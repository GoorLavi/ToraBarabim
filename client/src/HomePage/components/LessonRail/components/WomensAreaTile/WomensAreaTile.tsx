import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { CandlesEmblem } from '~/HomePage/components/CandlesEmblem/CandlesEmblem';
import { Chevron } from '~/HomePage/components/Chevron/Chevron';
import { WOMEN_PAGE_PATH } from '~/hooks/consts';

import * as consts from './consts';
import type { WomensAreaTileProps } from './models';
import * as styles from './styles';

// The tile carries its own proportions rather than stretching to a
// neighbouring lesson card's actual height: the plum area matches a lesson
// card's poster area exactly, and the white area's own height is derived
// from the same tokens a lesson card's text block renders with, so the two
// land at the same total height without depending on either card's own
// content (styles.ts).
export const WomensAreaTile = styled(({ className, lessonCount }: WomensAreaTileProps) => (
  <Link to={WOMEN_PAGE_PATH} className={className} aria-label={consts.tileAriaLabel(lessonCount)}>
    <div className="plum">
      {/* The `size` attribute is only ever a fallback before CSS applies:
          `.emblem` in styles.ts sizes it for real, as a live percentage of
          the tile's own width. */}
      <CandlesEmblem {...{ variant: 'onPlum', size: consts.EMBLEM_SIZE_FLOOR }} className="emblem" />
      <p className="count" dir="ltr">
        {lessonCount}
      </p>
      <p className="countWord">{consts.tileCountWord(lessonCount)}</p>
      <p className="line">{consts.TILE_LINE}</p>
    </div>

    <div className="white">
      <h3 className="heading">{consts.TILE_HEADING}</h3>
      <span className="seeAll">
        <Chevron />
        <span className="label">{consts.TILE_LINK_LABEL}</span>
      </span>
    </div>
  </Link>
))`
  ${styles.WomensAreaTile}
`;
