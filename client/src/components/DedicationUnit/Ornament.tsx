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
export const Ornament = styled(({ className, mirrored }: OrnamentProps) => {
  const gradientId = `dedication-ornament-gradient-${useId()}`;

  return (
    <svg
      className={classNames(className, { mirrored })}
      width={consts.ORNAMENT_VIEWBOX_WIDTH}
      height={consts.ORNAMENT_VIEWBOX_HEIGHT}
      viewBox={`0 0 ${consts.ORNAMENT_VIEWBOX_WIDTH} ${consts.ORNAMENT_VIEWBOX_HEIGHT}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="stop0" />
          <stop offset="0.4" className="stop40" />
          <stop offset="1" className="stop100" />
        </linearGradient>
      </defs>
      {consts.ORNAMENT_LEAF_PATHS.map((path) => (
        <path key={path} d={path} fill={`url(#${gradientId})`} />
      ))}
      {consts.ORNAMENT_VINE_PATHS.map((path) => (
        <path key={path} d={path} stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" />
      ))}
    </svg>
  );
})`
  ${styles.Ornament}
`;
