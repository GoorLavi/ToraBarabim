import classNames from 'classnames';
import styled from 'styled-components';

import { PrimaryButton } from '../PrimaryButton/PrimaryButton';
import { QuietButton } from '../QuietButton/QuietButton';
import type { StateCardProps } from './models';
import * as styles from './styles';

// One card, three uses across the site: a transient error, a not-found
// fact, and the ratified terminal empty state (00-shared-shell.md, "The
// state card"). The headline is weight 700 in every variant: 05-lessons.md
// measured its own empty card at 600, but the shared shell and every other
// page in this round measured 700, so the lighter weight is read as a
// one-off measurement rather than a real variant.
export const StateCard = styled((props: StateCardProps) => {
  const { className, variant, headingLevel, heading, body, action } = props;
  const ActionButton = action?.actionStyle === 'quiet' ? QuietButton : PrimaryButton;
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
      {action &&
        ('actionTo' in action ? (
          <ActionButton className="action" label={action.actionLabel} to={action.actionTo} />
        ) : (
          <ActionButton className="action" label={action.actionLabel} onClick={action.onAction} />
        ))}
    </div>
  );
})`
  ${styles.StateCard}
`;
