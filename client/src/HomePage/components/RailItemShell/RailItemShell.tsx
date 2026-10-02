import classNames from 'classnames';
import styled from 'styled-components';

import type { RailItemShellProps } from './models';
import * as styles from './styles';

// The box every rail item shares: a lesson card, the women's-area tile and
// the help tiles all fill their rail slot, stretch to the row's height and
// carry the same radius, focus ring and container. What an item looks like
// inside it is the caller's own.
export const RailItemShell = styled((props: RailItemShellProps) => {
  const { className, topArea, renderRoot, children } = props;
  const rootClassName = classNames(className, 'railItem', props.variant, props.variant === 'tinted' && props.tint);

  return renderRoot(
    rootClassName,
    <>
      {topArea !== undefined && <div className="topArea">{topArea}</div>}
      {children}
    </>,
  );
})`
  ${styles.RailItemShell}
`;
