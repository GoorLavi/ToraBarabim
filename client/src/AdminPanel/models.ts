import type { Rabbi, VisitorMessageStatusFilter } from '@torabarabim/common';

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

// Server-side filters, sent as query params on GET /v1/admin/visitor-messages.
// `status` is always explicit on the wire: the server reads an absent one as
// `all`, while the screen's own default is `unhandled`.
export interface AdminVisitorMessageFilters {
  status: VisitorMessageStatusFilter;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/places.
export interface AdminPlaceFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/courses. Its
// own `status` reads "open" as `lifecycle.status` `notOpen` or `open`
// together (the public card's own "Registration open" bucket), so the
// three filter buckets map straight onto it with no client-side narrowing.
export interface AdminCourseFilters {
  q?: string;
  status?: 'open' | 'full' | 'closed';
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
