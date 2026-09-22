// Query params for `GET /v1/place/lessons`: a place's own list has no
// filters in this slice, mirroring `RabbiPanel/models.ts`'s
// `RabbiLessonListFilters`.
export interface PlaceLessonListFilters {
  page: number;
  pageSize: number;
}
