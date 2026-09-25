import type { Rabbi } from '@torabarabim/common';

// Server-side filters, sent as query params on GET /v1/admin/lessons.
export interface AdminLessonFilters {
  cityId?: string;
  rabbiId?: string;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/rabbis.
export interface AdminRabbiFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/admin-users.
export interface AdminUserFilters {
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/dedications.
export interface AdminDedicationFilters {
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/places.
export interface AdminPlaceFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/courses. The
// server's own `status` has no `full` value of its own (a course marked
// full is still `status: 'closed'`, `reason: 'full'`): the list page filters
// a `status: 'closed'` response by `reason` itself for the "תפוסה מלאה" and
// "ההרשמה נסגרה" options, the same "server narrows, the client narrows
// further" split `LessonsListPage` already uses for its own filters.
export interface AdminCourseFilters {
  q?: string;
  status?: 'notOpen' | 'open' | 'closed';
  rabbiId?: string;
  page?: number;
  pageSize?: number;
}

// Lifted from `LessonFormPage/components/RabbiPicker/models.ts` once
// `CourseFormPage/components/TeacherPicker` became a second caller of
// `useRabbiSearch`.
export interface RabbiSearchResults {
  items: Rabbi[];
  isPending: boolean;
  isError: boolean;
}
