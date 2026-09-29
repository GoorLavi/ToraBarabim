import type { CourseResponse } from '@torabarabim/common';

import { courseOpeningDateLongLabel, joinWithMiddleDot, rabbiDisplayName, weeksPhrase } from '~/helpers';

import * as consts from './consts';

// "פתיחה ב־3 בנובמבר · 10 שבועות" (design brief round 3, item 3's own
// phone-row copy): the admin row's own shorter pair, weeks only, unlike the
// rabbi list's own opening line which also names the session count.
export const adminCourseOpeningLineLabel = (course: CourseResponse): string =>
  joinWithMiddleDot([courseOpeningDateLongLabel(course.openingDate), weeksPhrase(course.weeks)]);

// Shared by `CoursesCardList` and `CoursesTable`: a linked rabbi shows with
// their own honorific, an unlinked one names the editor's own "אין קישור
// לרב" wording (pass 2 brief) beside it.
export const adminCourseTeacherLabel = (course: CourseResponse): string =>
  course.teacher.kind === 'rabbi' ? rabbiDisplayName(course.teacher.rabbi) : consts.unlinkedTeacherListLabel(course.teacher.name);
