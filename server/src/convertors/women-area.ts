import type { WomenAreaResponse } from '@torabarabim/common';

import type { WomenAreaResult } from '../service/home/models';

// `courses` is wired to the real women's-scope set once `service/course/`
// lands in this slice's next milestone; the courses table does not exist yet.
export const toWomenAreaResponse = (result: WomenAreaResult): WomenAreaResponse =>
  result.kind === 'populated'
    ? { kind: 'populated', lessonCount: result.lessonCount, teachers: result.teachers, cities: result.cities, courses: [] }
    : { kind: 'empty', rabbaniyot: result.rabbaniyot, courses: [] };
