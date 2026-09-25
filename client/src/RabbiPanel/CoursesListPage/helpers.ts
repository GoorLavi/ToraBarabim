import type { CourseResponse } from '@torabarabim/common';

import { courseStillListed } from '~/helpers';

// The count line counts only courses currently on the site, including one
// in its own closed or full week: every course except one that has already
// left every list (design brief B, item 4).
export const isCurrentlyListed = (course: CourseResponse): boolean =>
  course.lifecycle.status !== 'closed' || courseStillListed(course.lifecycle.leavesListsOn);
