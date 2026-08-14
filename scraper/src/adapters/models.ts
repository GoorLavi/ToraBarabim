import type { Fetcher } from '../fetch/models';

// One record per lesson exactly as a source currently publishes it. Every
// field is the raw text the site prints, not yet parsed into a weekday, a
// time, or a domain enum: that conversion happens one layer up, in
// normalize/. A field the source does not publish is left undefined here.
// An adapter must never guess a value the source did not state, whether
// that source is a structured list in the HTML or a single schedule image.
export interface RawLesson {
  // Identifies this lesson within the adapter's own source only, stable
  // across runs of the same adapter. Derive it from the lesson's own
  // published content (e.g. weekday + start time + rabbi name), never from
  // its position in a list or on an image: reordering the source must not
  // look like every lesson changed.
  sourceItemId: string;
  titleRaw?: string;
  topicRaw?: string;
  audienceRaw?: string;
  rabbiNameRaw?: string;
  // A weekday name such as "יום שלישי" for a recurring lesson.
  weekdayRaw?: string;
  // A one-off date such as "13.08.2026" or "9.8" (year omitted).
  dateRaw?: string;
  startTimeRaw?: string;
  endTimeRaw?: string;
  durationRaw?: string;
  // A combined place string such as `ביה"כ אור ישראל, ביאליק 28`.
  placeRaw?: string;
  cityRaw?: string;
  notesRaw?: string;
}

export interface SourceAdapter {
  // Stable across runs. Used as the snapshot file name, the key namespace
  // for every lesson it collects, and the `--adapter` CLI argument.
  readonly id: string;
  // Human readable, used in the run report.
  readonly name: string;
  // Fetches and extracts whatever this source currently publishes, using
  // only the fetcher it is given so every request is rate limited and
  // cached. Throws on a failure that means the run could not complete;
  // returns an empty array if the source currently publishes nothing.
  collect(fetcher: Fetcher): Promise<RawLesson[]>;
}
