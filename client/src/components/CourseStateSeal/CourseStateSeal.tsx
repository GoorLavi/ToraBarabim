import classNames from 'classnames';
import styled from 'styled-components';

import type { CourseStateSealProps } from './models';
import * as styles from './styles';

// The corner seal every course poster carries, real or previewed
// (`CourseCard`, the admin's own `CoursePreviewCard`): the two-line shape
// LessonCard's own date medallion draws from (HomePage/components/LessonCard/
// styles.ts, ".medallion"), the small qualifying word over the big state
// word, with a gold rule between them for the two closed states.
export const CourseStateSeal = styled(({ className, small, big, isClosed }: CourseStateSealProps) => (
  <div className={classNames(className, 'stateTag', { closed: isClosed })}>
    <span className="small">{small}</span>
    {isClosed && <span className="rule" aria-hidden="true" />}
    <span className="big">{big}</span>
  </div>
))`
  ${styles.CourseStateSeal}
`;
