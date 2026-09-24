import type { CourseDetailResponse, CourseTeacher } from '@torabarabim/common';

import type { JsonLdObject } from '../models';

import { rabbiDisplayName } from '~/helpers';

import { SITE_NAME } from '../../../consts';

const cycleSuffix = (cycle: number | undefined): string => (cycle === undefined ? '' : `, מחזור ${cycle}`);

const teacherLabel = (teacher: CourseTeacher): string => (teacher.kind === 'rabbi' ? rabbiDisplayName(teacher.rabbi) : teacher.name);

// Document title and description for search results and link previews, not
// in-page copy.
export const coursePageTitle = (course: Pick<CourseDetailResponse, 'name' | 'cycle'>): string =>
  `${course.name}${cycleSuffix(course.cycle)} | קורס | ${SITE_NAME}`;

export const coursePageDescription = (course: CourseDetailResponse): string =>
  `הקורס ${course.name} של ${teacherLabel(course.teacher)}: תאריך הפתיחה, פרטים מלאים ואיך ליצור קשר, באתר ${SITE_NAME}.`;

// Minimal schema.org Course: name, description, image and provider, nothing
// that needs the session data (dates, price) this slice deliberately keeps
// off structured data. `provider` is always a Person: a linked course names
// the rabbi through `rabbiDisplayName`, an unlinked one the free text as
// typed, since schema.org has no better fit for a name with no honorific to
// enforce (plan, tora-ssr's consult answer).
export const courseJsonLd = (course: CourseDetailResponse, url: string): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  description: course.description,
  image: course.coverUrl,
  provider: { '@type': 'Person', name: teacherLabel(course.teacher) },
  url,
});

// route.tsx's own ErrorBoundary copy, mirroring rabbis.$rabbiId/consts.ts.
// There is no courses index page (plan, scope check 1.6) to link back to,
// so both cases point home instead of a listing this site does not have.
export const NOT_FOUND_HEADING = 'לא מצאנו את הקורס הזה';
export const NOT_FOUND_BODY = 'ייתכן שהקורס הוסר או שהקישור לא מדויק.';
export const ERROR_HEADING = 'לא הצלחנו לטעון את פרטי הקורס';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const BACK_TO_HOME_LABEL = 'לעמוד הבית';
