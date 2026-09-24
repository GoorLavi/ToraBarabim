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
