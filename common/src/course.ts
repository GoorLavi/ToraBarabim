import type { LessonAudience, LessonTopic } from './lesson';
import type { Rabbi } from './rabbi';
import type { LessonVenue, LessonVenueInput, LessonVenuePanel } from './venue';

export type CourseTeacher = { kind: 'rabbi'; rabbi: Rabbi } | { kind: 'named'; name: string };

export type CourseTopic = { value: Exclude<LessonTopic, 'other'> } | { value: 'other'; otherText: string };

export type CourseStatus = 'notOpen' | 'open' | 'closed';

// 'closed': registration ended, by the calendar or by hand. 'full': marked
// full by hand. Both are the same final closed state with a different
// reason shown on the card and the page.
export type CloseReason = 'closed' | 'full';

export type CourseState =
  | { status: 'notOpen' }
  | { status: 'open' }
  | { status: 'closed'; reason: CloseReason; closedOn: string };

// The public card/row shape, shared by the home row, the rabbi and place
// detail pages, and the women's area.
export interface CourseSummary {
  id: string;
  slug: string;
  name: string;
  cycle?: number;
  coverUrl: string;
  openingDate: string;
  state: CourseState;
  teacher: CourseTeacher;
  venue: LessonVenue;
  audience: LessonAudience;
}

// `contactPhone` is present only while registration is open: once closed,
// the actions it would drive are hidden, so the wire never carries it.
export type CourseDetailState =
  | { status: 'notOpen' | 'open'; contactPhone: string }
  | { status: 'closed'; reason: CloseReason; closedOn: string };

export interface CourseDetailResponse extends Omit<CourseSummary, 'state'> {
  state: CourseDetailState;
  description: string;
  weeks: number;
  sessions: number;
  hours?: number;
  topic?: CourseTopic;
  priceShekels?: number;
  photos: { id: string; url: string }[];
}

// Panel (rabbi and admin) course shapes: one response, shared by both.
export type PanelCourseTeacher = { kind: 'rabbi'; rabbiId: string; rabbi: Rabbi } | { kind: 'named'; name: string };

export type CourseLifecycleView =
  | { status: 'notOpen' | 'open'; closesOn: string }
  | { status: 'closed'; reason: CloseReason; closedOn: string; leavesListsOn: string };

export interface CourseResponse {
  id: string;
  slug: string;
  name: string;
  cycle?: number;
  description: string;
  teacher: PanelCourseTeacher;
  openingDate: string;
  weeks: number;
  sessions: number;
  hours?: number;
  venue: LessonVenuePanel;
  audience: LessonAudience;
  topic?: CourseTopic;
  joinableAfterOpening: boolean;
  contactPhone: string;
  priceShekels?: number;
  coverUrl: string;
  photos: { id: string; url: string }[];
  lifecycle: CourseLifecycleView;
}

// The fields both panels' create and update requests share. The multipart
// create's JSON `course` part is validated against this same shape.
export interface CourseFieldsRequest {
  name: string;
  cycle?: number;
  description: string;
  openingDate: string;
  weeks: number;
  sessions: number;
  hours?: number;
  venue: LessonVenueInput;
  audience: LessonAudience;
  topic?: CourseTopic;
  joinableAfterOpening: boolean;
  contactPhone: string;
  priceShekels?: number;
}

// A rabbi's own course always carries their own teacher identity, so
// neither request names one.
export type RabbiCreateCourseRequest = CourseFieldsRequest;
export type RabbiUpdateCourseRequest = CourseFieldsRequest;

export type CourseTeacherInput = { kind: 'rabbi'; rabbiId: string } | { kind: 'named'; name: string };

export type CreateCourseRequest = CourseFieldsRequest & { teacher: CourseTeacherInput };
export type UpdateCourseRequest = CreateCourseRequest;

export interface DuplicateCourseRequest {
  openingDate: string;
  cycle?: number;
}

export interface CourseListResponse {
  items: CourseResponse[];
  page: number;
  pageSize: number;
  total: number;
}

// The panel routes' own error codes, each with the `details` shape the
// server actually sends for it: the first typed error body in the
// codebase, kept to the course codes on purpose. `message` is the
// developer-facing English line off the thrown error, never rendered; a
// client surface builds its own Hebrew from `error` and `details`.
export const COURSE_ERROR_CODES = [
  'rabbanit_audience_must_be_women',
  'course_would_be_closed',
  'opening_date_not_future',
  'photo_too_small',
  'unsupported_file_type',
  'cover_required',
  'course_closed',
  'course_not_closed',
  'course_photo_limit',
] as const;

export type CourseErrorCode = (typeof COURSE_ERROR_CODES)[number];

export type CourseErrorBody =
  | { error: 'rabbanit_audience_must_be_women'; message: string; details: { audience: LessonAudience } }
  | { error: 'course_would_be_closed'; message: string; details: { openingDate: string } }
  | { error: 'opening_date_not_future'; message: string; details: { openingDate: string } }
  | {
      error: 'photo_too_small';
      message: string;
      details:
        | { kind: 'cover'; measuredWidth: number; measuredHeight: number; minWidth: number; minHeight: number }
        | { kind: 'gallery'; measuredShorterSide: number; minimum: number };
    }
  | { error: 'unsupported_file_type'; message: string; details: Record<string, never> }
  | { error: 'cover_required'; message: string; details: Record<string, never> }
  | { error: 'course_closed'; message: string; details: { courseName: string; reason: CloseReason } }
  | { error: 'course_not_closed'; message: string; details: { courseName: string } }
  | { error: 'course_photo_limit'; message: string; details: { max: number } };
