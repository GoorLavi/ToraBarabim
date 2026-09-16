import type { CityWithLessonCount } from './city-directory';
import type { Rabbi } from './rabbi';

// GET /v1/women's summary. `populated` describes the women's set (audience
// women or mixed, any teacher, the same 14-day window as `GET /v1/home`): a
// rav's women-only lesson counts here alongside a rabbanit's. `empty` still
// carries every rabbaniyot, so the page's rail has something to show even
// when no lesson qualifies. Each city's `lessonCount` is that same
// definition, split by the lesson's own city; the city counts sum to the
// summary's `lessonCount`.
export type WomenAreaResponse =
  | { kind: 'populated'; lessonCount: number; teachers: Rabbi[]; cities: CityWithLessonCount[] }
  | { kind: 'empty'; rabbaniyot: Rabbi[] };
