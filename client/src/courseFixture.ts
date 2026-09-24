import type {
  CourseDetailResponse,
  CourseLifecycleView,
  CourseResponse,
  CourseState,
  CourseSummary,
  LessonVenue,
  LessonVenuePanel,
  PanelCourseTeacher,
} from '@torabarabim/common';

import { rabbiFixture } from '~/rabbiFixture';
import { placeholderPhoto, slugFromName } from '~/storyMocks';

let nextCourseId = 1;

const defaultVenue: LessonVenue = {
  kind: 'address',
  name: 'בית הכנסת המרכזי',
  street: 'רחוב ויצמן 45',
  city: 'נתניה',
  citySlug: 'נתניה',
  area: 'sharon',
};

const defaultState: CourseState = { status: 'open' };

// A course fixture shared by every story that needs a `CourseSummary`,
// following `rabbiFixture`'s shape: `slug` derives from `name` unless a
// story needs to override it, and the cover defaults to a square
// placeholder so a story that never mentions `coverUrl` still renders a
// real image rather than a broken one (the wire type has no fallback,
// `coverUrl` is always required).
export const courseFixture = (course: Partial<CourseSummary> & Pick<CourseSummary, 'name'>): CourseSummary => ({
  id: course.id ?? `course-${nextCourseId++}`,
  slug: course.slug ?? slugFromName(course.name),
  name: course.name,
  cycle: course.cycle,
  coverUrl: course.coverUrl ?? placeholderPhoto(600, 600),
  openingDate: course.openingDate ?? '2026-11-03',
  state: course.state ?? defaultState,
  teacher: course.teacher ?? { kind: 'rabbi', rabbi: rabbiFixture({ id: 'course-rabbi', name: 'אייל עמרמי' }) },
  venue: course.venue ?? defaultVenue,
  audience: course.audience ?? 'mixed',
});

// The detail shape `CoursePage` reads, built on top of `courseFixture` so
// the two never drift on the fields they share.
export const courseDetailFixture = (
  course: Partial<Omit<CourseDetailResponse, 'state'>> & Pick<CourseDetailResponse, 'name'> & { state?: CourseDetailResponse['state'] },
): CourseDetailResponse => {
  const summary = courseFixture(course);
  return {
    ...summary,
    state: course.state ?? { status: 'open', contactPhone: '0501234567' },
    description: course.description ?? 'קורס עיוני בנושאי אמונה והלכה, למתחילים ולמתקדמים כאחד.',
    weeks: course.weeks ?? 10,
    sessions: course.sessions ?? 10,
    hours: course.hours,
    priceShekels: course.priceShekels,
    photos: course.photos ?? [
      { id: 'photo-1', url: placeholderPhoto(1200, 900) },
      { id: 'photo-2', url: placeholderPhoto(1200, 900) },
    ],
  };
};

const defaultVenuePanel: LessonVenuePanel = {
  kind: 'address',
  name: 'בית הכנסת המרכזי',
  street: 'רחוב ויצמן 45',
  cityCode: 4000,
  cityName: 'נתניה',
};

const defaultTeacher: PanelCourseTeacher = { kind: 'rabbi', rabbiId: 'course-rabbi', rabbi: rabbiFixture({ id: 'course-rabbi', name: 'אייל עמרמי' }) };

const defaultLifecycle: CourseLifecycleView = { status: 'open', closesOn: '2027-01-15' };

// The rabbi and admin panels' own shape, built independently of
// `courseFixture` above rather than on top of it: `CourseResponse` and
// `CourseSummary` share no common ancestor type, only some field names, and
// their `venue` and `teacher` arms differ (`LessonVenuePanel`/`PanelCourseTeacher`
// versus the public `LessonVenue`/`CourseTeacher`).
export const courseResponseFixture = (course: Partial<CourseResponse> & Pick<CourseResponse, 'name'>): CourseResponse => ({
  id: course.id ?? `course-${nextCourseId++}`,
  slug: course.slug ?? slugFromName(course.name),
  name: course.name,
  cycle: course.cycle,
  description: course.description ?? 'קורס עיוני בנושאי אמונה והלכה, למתחילים ולמתקדמים כאחד.',
  teacher: course.teacher ?? defaultTeacher,
  openingDate: course.openingDate ?? '2026-11-03',
  weeks: course.weeks ?? 10,
  sessions: course.sessions ?? 10,
  hours: course.hours,
  venue: course.venue ?? defaultVenuePanel,
  audience: course.audience ?? 'mixed',
  topic: course.topic,
  joinableAfterOpening: course.joinableAfterOpening ?? false,
  contactPhone: course.contactPhone ?? '0501234567',
  priceShekels: course.priceShekels,
  coverUrl: course.coverUrl ?? placeholderPhoto(600, 800),
  photos: course.photos ?? [],
  lifecycle: course.lifecycle ?? defaultLifecycle,
});
