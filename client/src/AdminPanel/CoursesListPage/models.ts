import type { CourseResponse } from '@torabarabim/common';

import type { AdminApiError } from '~/AdminPanel/api';

export interface CoursesListPageProps {
  className?: string;
}

// The four options the filter shows; `'all'` sends no `status` to the
// server at all. `'open'` covers both `notOpen` and `open` (the public
// card's own "Registration open" bucket, ~/CoursePage/consts.ts's own
// COURSE_STATE_TAG_OPEN comment), and `'full'`/`'closed'` split the
// server's single `closed` status by `lifecycle.reason`, client-side (see
// `helpers.ts`, `courseStatusBucket`): the server's own filter enum has no
// `full` value of its own.
export type AdminCourseStatusFilter = 'all' | 'open' | 'full' | 'closed';

export type AdminCoursesListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; rows: CourseResponse[]; total: number };
