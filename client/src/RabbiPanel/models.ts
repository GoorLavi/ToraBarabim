// Query params for `GET /v1/rabbi/lessons`: a rabbi's own list has no
// filters in this slice (design doc, section 4), so this is page/pageSize
// only, always `RABBI_LESSON_PAGE_SIZE`.
export interface RabbiLessonListFilters {
  page: number;
  pageSize: number;
}
