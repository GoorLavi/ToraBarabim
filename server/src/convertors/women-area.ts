import type { WomenAreaResponse } from '@torabarabim/common';

import { toCourseSummary } from './course';
import type { WomenAreaResult } from '../service/home/models';

export const toWomenAreaResponse = (result: WomenAreaResult): WomenAreaResponse => {
  const courses = result.courses.map(toCourseSummary);
  return result.kind === 'populated'
    ? { kind: 'populated', lessonCount: result.lessonCount, teachers: result.teachers, cities: result.cities, courses }
    : { kind: 'empty', rabbaniyot: result.rabbaniyot, courses };
};
