import classNames from 'classnames';
import { useId } from 'react';
import styled from 'styled-components';

import * as consts from './consts';
import type { OrnamentProps } from './models';
import * as styles from './styles';

// Hand authored and inlined in the DOM rather than referenced through
// `<img>`: external CSS cannot reach inside an `<img>`, and the gradient
// stops have to be settable per variant through the ancestor's custom
// properties. Purely decorative, so `aria-hidden` and `focusable="false"`
// keep it out of the tab order in a band that is itself focusable for its
// pause-on-focus behaviour.
//
// `useId()` gives every rendered instance its own gradient id, so its own
// `<defs>` sits inside its own `<svg>`, inside its own ancestor's variant
// class. This is what makes it safe for `onPrimary` and `onPage` instances
// to sit on the same page at once (the foot band and the between-rails
// band always do): a custom property resolves where the `<stop>` reading it
// is defined, never where the gradient happens to be used, so a single
// shared `<defs>` referenced by both would paint both from whichever
// variant's context it sat in. There is one definition per instance instead,
// never one shared definition.
export const Ornament = styled(({ className, mirrored }: OrnamentProps) => {
  const gradientId = `dedication-ornament-gradient-${useId()}`;

  return (
    <svg
      className={classNames(className, { mirrored })}
      width={consts.ORNAMENT_VIEWBOX_WIDTH}
      height={consts.ORNAMENT_VIEWBOX_HEIGHT}
      viewBox={`0 ${consts.ORNAMENT_VIEWBOX_MIN_Y} ${consts.ORNAMENT_VIEWBOX_WIDTH} ${consts.ORNAMENT_VIEWBOX_HEIGHT}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* objectBoundingBox, not the Figma export's own user-space span
            (y 0.557617 to 52.5228): that span is this one path's bounding
            box at this one viewBox, and would silently go stale the moment
            either changes. The relative form is identical today and stays
            correct regardless. */}
        <linearGradient id={gradientId} gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="stop0" />
          <stop offset="0.4" className="stop40" />
          <stop offset="1" className="stop100" />
        </linearGradient>
      </defs>
      <path d={consts.ORNAMENT_PATH} fill={`url(#${gradientId})`} fillRule="nonzero" />
    </svg>
  );
})`
  ${styles.Ornament}
`;
