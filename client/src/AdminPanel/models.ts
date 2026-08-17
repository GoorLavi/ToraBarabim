// Server-side filters, sent as query params on GET /v1/admin/lessons.
export interface AdminLessonFilters {
  cityId?: string;
  rabbiId?: string;
  placeId?: string;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/rabbis.
export interface AdminRabbiFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

// Server-side filters, sent as query params on GET /v1/admin/places.
export interface AdminPlaceFilters {
  q?: string;
  cityId?: string;
  page?: number;
  pageSize?: number;
}
