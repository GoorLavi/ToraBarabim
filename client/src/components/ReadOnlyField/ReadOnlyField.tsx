import styled from 'styled-components';

import type { ReadOnlyFieldProps } from './models';
import * as styles from './styles';

// A label, a fixed value shown in a filled block, and a helper line below
// it: the look for any field whose value the person cannot change here.
export const ReadOnlyField = styled(({ className, label, value, helper }: ReadOnlyFieldProps) => (
  <div className={className}>
    {label && <span className="label">{label}</span>}
    <p className="value" dir="auto">
      {value}
    </p>
    <span className="helper">{helper}</span>
  </div>
))`
  ${styles.ReadOnlyField}
`;
