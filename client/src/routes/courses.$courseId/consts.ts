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

// Once closed, the contact number leaves the wire (`CourseDetailState`), so
// the description drops the clause promising a way to reach out.
export const coursePageDescription = (course: CourseDetailResponse): string => {
  const teacher = teacherLabel(course.teacher);
  return course.state.status === 'closed'
    ? `הקורס ${course.name} של ${teacher}: תאריך הפתיחה ופרטים מלאים, באתר ${SITE_NAME}.`
    : `הקורס ${course.name} של ${teacher}: תאריך הפתיחה, פרטים מלאים ואיך ליצור קשר, באתר ${SITE_NAME}.`;
};

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
