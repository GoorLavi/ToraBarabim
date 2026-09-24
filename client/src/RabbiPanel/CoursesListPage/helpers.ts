import type { CourseResponse } from '@torabarabim/common';

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const israelDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: ISRAEL_TIME_ZONE });
const todayInIsrael = (): string => israelDateFormatter.format(new Date());

// The count line counts only courses currently on the site, including one
// in its own closed or full week: every course except one that has already
// left every list (design brief B, item 4).
export const isCurrentlyListed = (course: CourseResponse): boolean =>
  course.lifecycle.status !== 'closed' || todayInIsrael() < course.lifecycle.leavesListsOn;
