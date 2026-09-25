import type { CourseResponse } from '@torabarabim/common';

import { courseStatusBucket } from '~/AdminPanel/helpers';
import { israelDayMonthLabel, joinWithMiddleDot, rabbiDisplayName, singularOrCount } from '~/helpers';

import * as consts from './consts';
import type { AdminCourseStatusFilter } from './models';

export const matchesStatusFilter = (course: CourseResponse, filter: AdminCourseStatusFilter): boolean => {
  if (filter === 'all') return true;
  const bucket = courseStatusBucket(course);
  if (filter === 'open') return bucket === 'notOpen' || bucket === 'open';
  return bucket === filter;
};

// "ההרשמה פתוחה" first, nearest opening date first; "תפוסה מלאה" and
// "ההרשמה נסגרה" both after it (design brief round 3, item 3's own sort
// note), each group itself by nearest opening date too.
const bucketRank = (course: CourseResponse): number => (courseStatusBucket(course) === 'closed' || courseStatusBucket(course) === 'full' ? 1 : 0);

export const sortCourseRows = (rows: CourseResponse[]): CourseResponse[] =>
  [...rows].sort((a, b) => bucketRank(a) - bucketRank(b) || a.openingDate.localeCompare(b.openingDate));

// The admin list's own closed-line: the closed date and the course's own
// length, never the "leaves the lists on" date the public-facing panels
// show (`~/helpers.ts`'s own `courseClosedLineLabel`), since an admin row
// already carries a status tag naming the reason.
export const adminCourseClosedLineLabel = (course: CourseResponse): string => {
  if (course.lifecycle.status !== 'closed') return '';
  const verb = course.lifecycle.reason === 'full' ? 'סומן' : 'נסגרה';
  return joinWithMiddleDot([`${verb} ב־${israelDayMonthLabel(course.lifecycle.closedOn)}`, singularOrCount(course.weeks, 'שבוע אחד', 'שבועות')]);
};

// "פתיחה ב־3 בנובמבר · 10 שבועות" (design brief round 3, item 3's own
// phone-row copy): the admin row's own shorter pair, weeks only, unlike the
// rabbi list's own opening line which also names the session count.
export const adminCourseOpeningLineLabel = (course: CourseResponse): string =>
  joinWithMiddleDot([`פתיחה ב־${israelDayMonthLabel(course.openingDate)}`, singularOrCount(course.weeks, 'שבוע אחד', 'שבועות')]);

// Shared by `CoursesCardList` and `CoursesTable`: a linked rabbi shows with
// their own honorific, an unlinked one names the editor's own "אין קישור
// לרב" wording (pass 2 brief) beside it.
export const adminCourseTeacherLabel = (course: CourseResponse): string =>
  course.teacher.kind === 'rabbi' ? rabbiDisplayName(course.teacher.rabbi) : consts.unlinkedTeacherListLabel(course.teacher.name);
