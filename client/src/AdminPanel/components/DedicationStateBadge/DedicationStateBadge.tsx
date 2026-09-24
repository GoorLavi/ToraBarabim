import classNames from 'classnames';
import styled from 'styled-components';

import { DEDICATION_STATE_LABELS } from '~/AdminPanel/consts';

import type { DedicationStateBadgeProps } from './models';
import * as styles from './styles';

// Shared by `DedicationsListPage`'s cards and `DedicationViewPage`'s header,
// the nearest common ancestor both sit under (root CLAUDE.md, Scope and
// Boundaries).
export const DedicationStateBadge = styled(({ className, state }: DedicationStateBadgeProps) => (
  <span className={classNames(className, state)}>{DEDICATION_STATE_LABELS[state]}</span>
))`
  ${styles.DedicationStateBadge}
`;
