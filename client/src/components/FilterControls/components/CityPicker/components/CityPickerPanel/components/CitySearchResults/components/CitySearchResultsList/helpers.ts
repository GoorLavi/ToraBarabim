import type { CitySearchResult } from '@torabarabim/common';

import { lessonCountLabel } from '~/consts';

import { NO_LESSONS_YET_LABEL } from './consts';

export const resultMetaLine = (item: CitySearchResult): string =>
  `${item.areaName}, ${item.lessonCount === 0 ? NO_LESSONS_YET_LABEL : lessonCountLabel(item.lessonCount)}`;
