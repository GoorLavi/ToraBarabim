import type { WomenAreaResponse } from '@torabarabim/common';

import type { WomenAreaResult } from '../service/home/models';

export const toWomenAreaResponse = (result: WomenAreaResult): WomenAreaResponse =>
  result.kind === 'populated'
    ? { kind: 'populated', lessonCount: result.lessonCount, teachers: result.teachers, cities: result.cities }
    : { kind: 'empty', rabbaniyot: result.rabbaniyot };
