import { StateCard } from '~/components/StateCard/StateCard';

import type { NotFoundScreenProps } from './models';

// A thin adapter over the shared StateCard: always the bordered `surface`
// fill with a primary-styled action, for the two facts this renders (a
// missing route, a missing lesson occurrence) rather than a transient
// error's retry-styled quiet option.
export const NotFoundScreen = (props: NotFoundScreenProps) => {
  const { className, heading, explanation, actionLabel } = props;

  return (
    <StateCard
      className={className}
      variant="surface"
      heading={heading}
      body={explanation}
      action={
        'actionTo' in props
          ? { actionLabel, actionStyle: 'primary', actionTo: props.actionTo }
          : { actionLabel, actionStyle: 'primary', onAction: props.onAction }
      }
    />
  );
};
