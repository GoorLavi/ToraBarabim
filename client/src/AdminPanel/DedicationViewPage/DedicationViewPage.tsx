import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { DedicationStateBadge } from '~/AdminPanel/components/DedicationStateBadge/DedicationStateBadge';
import { RecordField } from '~/AdminPanel/components/RecordField/RecordField';
import {
  ADMIN_ROUTES,
  DEDICATION_HONORIFIC_LABELS,
  DEDICATION_TYPE_LABELS,
  HONORED_GENDER_LABELS,
  NO_HONORIFIC_LABEL,
  skeletonFieldKeys,
} from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingDedication } from '~/AdminPanel/useExistingDedication';
import { DedicationUnit } from '~/components/DedicationUnit/DedicationUnit';

import { TakedownDedicationButton } from './components/TakedownDedicationButton/TakedownDedicationButton';
import * as consts from './consts';
import { dedicationWindowLabel } from './helpers';
import type { DedicationViewPageProps } from './models';
import * as styles from './styles';

// The route-provided `id` is always present for this screen (AdminPanel.tsx
// mounts it only at `/admin/dedications/:id`); `useExistingDedication`
// already degrades to its disabled/pending status if it were ever missing.
export const DedicationViewPage = styled(({ className }: DedicationViewPageProps) => {
  const { id } = useParams<{ id: string }>();
  const existingDedication = useExistingDedication(id);

  if (existingDedication.isError) {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.dedications}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="state error" role="alert">
          <p className="message">{adminErrorMessage(existingDedication.error)}</p>
          <button type="button" className="retry" onClick={() => existingDedication.refetch()}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  if (existingDedication.isPending) {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={ADMIN_ROUTES.dedications}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>

        <div className="skeleton" aria-live="polite" aria-label={consts.LOADING_MESSAGE}>
          <div className="skeletonHeader">
            <div className="skeletonLine wide" />
            <div className="skeletonLine short" />
          </div>
          <div className="skeletonFieldsGrid">
            {skeletonFieldKeys(consts.SKELETON_FIELD_COUNT).map((key) => (
              <div key={key} className="skeletonField" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dedication = existingDedication.data;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={ADMIN_ROUTES.dedications}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <div className="main">
        <header className="header">
          <div className="identity">
            <div className="typeRow">
              <span className="type">{DEDICATION_TYPE_LABELS[dedication.type]}</span>
              <DedicationStateBadge state={dedication.state} />
            </div>
            <h1 className="heading" dir="auto">
              {dedication.display.nameLine}
            </h1>
          </div>

          <Link className="editButton" to={ADMIN_ROUTES.dedicationEdit(dedication.id)}>
            {consts.EDIT_LABEL}
          </Link>
        </header>

        <div className="fieldsGrid">
          <RecordField
            label={consts.HONORIFIC_LABEL}
            value={dedication.honorific ? DEDICATION_HONORIFIC_LABELS[dedication.honorific] : NO_HONORIFIC_LABEL}
            isEmpty={!dedication.honorific}
          />
          <RecordField label={consts.GENDER_LABEL} value={HONORED_GENDER_LABELS[dedication.honoredGender]} />
          <RecordField
            label={consts.PARENT_NAME_LABEL}
            value={dedication.parentName ?? consts.PARENT_NAME_EMPTY_VALUE}
            isEmpty={!dedication.parentName}
          />
          <RecordField
            label={consts.DONOR_FAMILY_NAME_LABEL}
            value={dedication.donorFamilyName ?? consts.DONOR_FAMILY_NAME_EMPTY_VALUE}
            isEmpty={!dedication.donorFamilyName}
          />
          {dedication.type === 'memorial' && (
            <RecordField
              label={consts.CLOSING_LINE_LABEL}
              value={dedication.closingLineEnabled ? consts.CLOSING_LINE_ON_VALUE : consts.CLOSING_LINE_OFF_VALUE}
            />
          )}
          <RecordField label={consts.WINDOW_LABEL} value={dedicationWindowLabel(dedication)} />
          {dedication.state === 'takenDown' && dedication.takenDownReason && (
            <RecordField className="wide" label={consts.TAKEDOWN_REASON_LABEL} value={dedication.takenDownReason} />
          )}
        </div>

        <div className="previewSection">
          <p className="previewLabel">{consts.PREVIEW_HEADING}</p>
          <div className="previewField">
            <DedicationUnit text={dedication.display} variant="onPage" />
          </div>
        </div>

        {dedication.state !== 'takenDown' && (
          <div className="dangerZone">
            <TakedownDedicationButton dedicationId={dedication.id} />
          </div>
        )}
      </div>
    </div>
  );
})`
  ${styles.DedicationViewPage}
`;
