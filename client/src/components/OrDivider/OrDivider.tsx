import styled from 'styled-components';

import * as consts from './consts';
import type { OrDividerProps } from './models';
import * as styles from './styles';

// A hairline fork between two ways of filling in the same field: a search
// picker above it, a free-text fallback below (`PlacePicker`'s own venue
// fork, `TeacherPicker`'s own teacher fork). Lifted here once `TeacherPicker`
// became a second caller of `PlacePicker`'s own divider markup.
export const OrDivider = styled(({ className }: OrDividerProps) => (
  <div className={className} aria-hidden="true">
    <span className="line" />
    <span className="label">{consts.OR_LABEL}</span>
    <span className="line" />
  </div>
))`
  ${styles.OrDivider}
`;
