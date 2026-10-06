import styled from 'styled-components';

import type { ReportContextProps } from './models';
import * as styles from './styles';

export const ReportContext = styled(({ className, label, lines }: ReportContextProps) => (
  <div className={className}>
    <p className="label">{label}</p>
    {lines.map((line) => (
      <p key={line} className="line" dir="auto">
        {line}
      </p>
    ))}
  </div>
))`
  ${styles.ReportContext}
`;
