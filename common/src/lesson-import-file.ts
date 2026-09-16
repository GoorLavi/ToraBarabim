// The handoff contract between `/collect-lessons` and `/import-lessons`
// (plan section 4a): a rows file the collector writes and the import reads.
// Values keep the collection procedure's own Hebrew vocabulary (weekday
// names, קבוע/משתנה, the delivery-type and audience labels); the server is
// the one place that maps them onto the product's own types.

export type LessonImportSourceStatus = 'ok' | 'failed';

export interface LessonImportSource {
  domain: string;
  name: string;
  url: string;
  format: string;
  declaredRange?: string;
  status: LessonImportSourceStatus;
  failureReason?: string;
  rowCount: number;
}

export interface LessonImportRow {
  rabbiName: string;
  // ISO date ('YYYY-MM-DD'), when the source names one.
  date?: string;
  // The procedure's own weekday vocabulary, e.g. 'ראשון' .. 'שבת קודש', or
  // 'מוצ"ש'. Mandatory: a row with neither a recognised weekday nor a date
  // is dropped at the source, per the procedure.
  weekday: string;
  hebrewDate?: string;
  // 'HH:mm'.
  startTime: string;
  // What the time represents, in the source's own words: 'שיעור',
  // 'פתיחת שערים', 'מנחה ושיעור', 'ערבית ושיעור', 'שידור', or another value
  // a learned rule maps.
  timeKind: string;
  endTime?: string;
  // 'שיעור פיזי' | 'שידור' | 'משולב'.
  deliveryType: string;
  city?: string;
  place: string;
  street?: string;
  topic?: string;
  // 'קבוע' | 'משתנה', absent when the source does not say.
  recurrence?: string;
  // 'גברים' | 'גברים ונשים בהפרדה' | 'עזרת נשים פתוחה', absent when the
  // source does not say.
  audience?: string;
  // Free text, e.g. the source's declared date range or an out-of-date
  // notice carried verbatim. Never written to a lesson.
  notes?: string;
  sources: string[];
  pageUrl?: string;
  needsReview: boolean;
}

export interface LessonImportDroppedRow {
  source: string;
  description: string;
  reason: string;
}

export interface LessonImportFile {
  schemaVersion: 1;
  collectedAt: string;
  week: string;
  sources: LessonImportSource[];
  rows: LessonImportRow[];
  dropped: LessonImportDroppedRow[];
}
