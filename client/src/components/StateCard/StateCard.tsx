import classNames from 'classnames';
import type { ReactNode } from 'react';
import styled from 'styled-components';

import { PrimaryButton } from '../PrimaryButton/PrimaryButton';
import { QuietButton } from '../QuietButton/QuietButton';
import type { StateCardAction, StateCardProps } from './models';
import * as styles from './styles';

// Rendered in JSX, never chosen into a variable: `QuietButton` and
// `PrimaryButton` carry different prop unions (QuietButton's own third,
// `href`, branch among them), and a variable typed to hold either is a
// JSX element type TypeScript cannot resolve to one call signature
// (TS2604). Branching in the markup itself, on both `actionStyle` and which
// of `actionTo`/`onAction` the action carries, needs no cast to get there.
const renderAction = (action: StateCardAction): ReactNode => {
  if (action.actionStyle === 'quiet') {
    return 'actionTo' in action ? (
      <QuietButton className="action" label={action.actionLabel} to={action.actionTo} />
    ) : (
      <QuietButton className="action" label={action.actionLabel} onClick={action.onAction} />
    );
  }

  return 'actionTo' in action ? (
    <PrimaryButton className="action" label={action.actionLabel} to={action.actionTo} />
  ) : (
    <PrimaryButton className="action" label={action.actionLabel} onClick={action.onAction} />
  );
};

// One card, three uses across the site: a transient error, a not-found
// fact, and the ratified terminal empty state (00-shared-shell.md, "The
// state card"). The headline is weight 700 in every variant: 05-lessons.md
// measured its own empty card at 600, but the shared shell and every other
// page in this round measured 700, so the lighter weight is read as a
// one-off measurement rather than a real variant.
export const StateCard = styled((props: StateCardProps) => {
  const { className, variant, headingLevel, heading, body, action } = props;
  const Heading = headingLevel;

  return (
    <div className={classNames(className, variant)} role={variant === 'surface' ? 'alert' : undefined}>
      <Heading className="heading" dir="auto">
        {heading}
      </Heading>
      {body && (
        <p className="body" dir="auto">
          {body}
        </p>
      )}
      {action && renderAction(action)}
    </div>
  );
})`
  ${styles.StateCard}
`;
