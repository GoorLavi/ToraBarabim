import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import type { RecordFieldProps } from './models';
import * as styles from './styles';

// A label-and-value row for a read-only record (LessonViewPage,
// RabbiViewPage): plain text, no fill, no border, distinct from
// `ReadOnlyField`, which reads as a disabled form input and belongs inside
// an otherwise-editable form instead.
export const RecordField = styled(({ className, label, value, isEmpty = false, linkTo, valueDir }: RecordFieldProps) => (
  <div className={classNames(className, { empty: isEmpty })}>
    <span className="label">{label}</span>
    <p className="value">
      {linkTo ? (
        <Link className="valueLink" to={linkTo}>
          <bdi dir={valueDir}>{value}</bdi>
        </Link>
      ) : (
        <bdi dir={valueDir}>{value}</bdi>
      )}
    </p>
  </div>
))`
  ${styles.RecordField}
`;
