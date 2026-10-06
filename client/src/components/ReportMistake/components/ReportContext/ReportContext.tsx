import styled from 'styled-components';

import type { ReportContextProps } from './models';
import * as styles from './styles';

// The first line is what the report is about and reads as its name; the rest
// are facts about it.
export const ReportContext = styled(({ className, label, lines }: ReportContextProps) => {
  const [subject, ...details] = lines;

  return (
    <div className={className}>
      <p className="label">{label}</p>
      {subject && (
        <p className="subject" dir="auto">
          {subject}
        </p>
      )}
      {details.map((line) => (
        <p key={line} className="detail" dir="auto">
          {line}
        </p>
      ))}
    </div>
  );
})`
  ${styles.ReportContext}
`;
