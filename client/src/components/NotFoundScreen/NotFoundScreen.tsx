import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { NotFoundScreenProps } from './models';
import * as styles from './styles';

// Shared by the lesson page's "lesson not found" / "could not load" states
// and the app-wide catch-all route: a `surface` card with a heading, an
// explanation line and a 48-high button, so a dead end always reads the
// same way and always offers a way back (design spec, "Error and not found").
export const NotFoundScreen = styled((props: NotFoundScreenProps) => {
  const { className, heading, explanation, actionLabel } = props;

  return (
    <div className={className}>
      <div className="card">
        <h1 className="heading" dir="auto">
          {heading}
        </h1>
        <p className="explanation" dir="auto">
          {explanation}
        </p>
        {'actionTo' in props ? (
          <Link to={props.actionTo} className="action">
            {actionLabel}
          </Link>
        ) : (
          <button type="button" className="action" onClick={props.onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
})`
  ${styles.NotFoundScreen}
`;
