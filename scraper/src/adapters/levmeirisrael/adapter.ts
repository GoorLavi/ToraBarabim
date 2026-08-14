import type { RawLesson, SourceAdapter } from '../models';
import type { Fetcher } from '../../fetch/models';
import { RABBI_NAME, SOURCE_URL } from './consts';
import type { OneOffLecture, RecurringLecture } from './models';
import { parseOneOffLectures } from './one-off';
import { parseRecurringLectures } from './recurring';

const toOneOffRawLesson = (lecture: OneOffLecture): RawLesson => ({
  sourceItemId: `once:${lecture.dateStr}:${lecture.city}:${lecture.place}:${lecture.time}`,
  rabbiNameRaw: RABBI_NAME,
  dateRaw: lecture.dateStr,
  cityRaw: lecture.city,
  placeRaw: lecture.place,
  startTimeRaw: lecture.time,
});

// Recurring lessons carry no weekday on this site at all: emitting neither
// weekdayRaw nor dateRaw is deliberate, so normalize/ reports a genuine gap
// for a human to resolve instead of a guessed day.
const toRecurringRawLesson = (lecture: RecurringLecture): RawLesson => ({
  sourceItemId: `fixed:${lecture.city}:${lecture.place}:${lecture.time}`,
  rabbiNameRaw: RABBI_NAME,
  cityRaw: lecture.city,
  placeRaw: lecture.place,
  startTimeRaw: lecture.time,
});

export const levMeirIsraelAdapter: SourceAdapter = {
  id: 'levmeirisrael',
  name: 'Lev Meir Israel (levmeirisrael.com)',

  async collect(fetcher: Fetcher): Promise<RawLesson[]> {
    const html = await fetcher.fetchText(SOURCE_URL);

    const oneOff = parseOneOffLectures(html).map(toOneOffRawLesson);
    const recurring = parseRecurringLectures(html).map(toRecurringRawLesson);

    return [...oneOff, ...recurring];
  },
};
