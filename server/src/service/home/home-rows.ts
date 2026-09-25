import type { CourseSummaryRecord } from '../course/models';
import type { CourseHomeRowResult, HomeRowResult, LessonHomeRowResult } from './models';

// The home row's own title (spec section 13): the one wording true of every
// card in the row, open or closed alike.
export const COURSE_ROW_TITLE = 'קורסים';

// Pure so it can be proven without a database: no listed course ever means
// no row, and one listed course always lands right after the first lesson
// row, or at index 0 when there is none (plain A, the owner's call at the
// gate). Sent from the first course, with no count cap and no lookahead cap
// (spec section 5), and with no skew mitigation for an open tab during a
// deploy.
export const placeCourseRow = (lessonRows: LessonHomeRowResult[], courseItems: CourseSummaryRecord[]): HomeRowResult[] => {
  if (courseItems.length === 0) return lessonRows;
  const courseRow: CourseHomeRowResult = { kind: 'courses', id: 'courses', title: COURSE_ROW_TITLE, items: courseItems };
  return [...lessonRows.slice(0, 1), courseRow, ...lessonRows.slice(1)];
};
