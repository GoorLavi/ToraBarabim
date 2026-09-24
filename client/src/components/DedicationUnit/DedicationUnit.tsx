import classNames from 'classnames';
import styled from 'styled-components';

import { Ornament } from './Ornament';
import type { DedicationUnitProps } from './models';
import * as styles from './styles';

// Renders four ready-made segments the server already composed; it never
// builds a string of its own (design-system.md, "The composed string": the
// name, honorific, and every non-breaking space are load bearing and sit on
// the wire, not assembled at the render seam). `parentLine`, `closingLine`
// and `donorCreditLine` are absent, not empty, when the field behind them
// was never set, so each renders only when present.
export const DedicationUnit = styled(({ className, text, variant }: DedicationUnitProps) => {
  return (
    <div className={classNames(className, variant)}>
      <Ornament />
      <div className="text">
        <p className="formula" dir="auto">
          {text.formulaLine}
        </p>
        <p className="name" dir="auto">
          {text.nameLine}
        </p>
        {text.parentLine && (
          <p className="parent" dir="auto">
            {text.parentLine}
          </p>
        )}
        {text.closingLine && (
          <p className="closing" dir="auto">
            {text.closingLine}
          </p>
        )}
        {text.donorCreditLine && (
          <p className="donorCredit" dir="auto">
            {text.donorCreditLine}
          </p>
        )}
      </div>
      <Ornament mirrored />
    </div>
  );
})`
  ${styles.DedicationUnit}
`;
