import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES, DEDICATION_TYPE_LABELS, DETAILS_LABEL } from '~/AdminPanel/consts';
import { DedicationStateBadge } from '~/AdminPanel/components/DedicationStateBadge/DedicationStateBadge';
import { dedicationWindowLabel } from '~/AdminPanel/helpers';

import type { DedicationCardProps } from './models';
import * as styles from './styles';

export const DedicationCard = styled(({ className, dedication }: DedicationCardProps) => (
  <article className={className}>
    <div className="body">
      <div className="head">
        <span className="type">{DEDICATION_TYPE_LABELS[dedication.type]}</span>
        <DedicationStateBadge state={dedication.state} />
      </div>

      <h3 className="name" dir="auto">
        {dedication.display.nameLine}
      </h3>

      <p className="window">{dedicationWindowLabel(dedication)}</p>
    </div>

    <Link className="edit" to={ADMIN_ROUTES.dedicationView(dedication.id)}>
      {DETAILS_LABEL}
    </Link>
  </article>
))`
  ${styles.DedicationCard}
`;
