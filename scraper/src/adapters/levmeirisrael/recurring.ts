import * as cheerio from 'cheerio';

import type { RecurringLecture } from './models';

// Parses the .fixed-item cards: recurring lessons published with no
// weekday at all. Rows missing a city, place, or time are dropped rather
// than passed on half-filled, since a lecture missing its place is not
// usable data even before it reaches the normalizer.
export const parseRecurringLectures = (html: string): RecurringLecture[] => {
  const $ = cheerio.load(html);

  return $('.fixed-item')
    .map((_, element) => {
      const city = $(element).find('.fixed-city').text().trim();
      const place = $(element).find('.fixed-place').text().trim();
      const time = $(element).find('.fixed-time').text().trim();
      return { city, place, time };
    })
    .toArray()
    .filter((lecture): lecture is RecurringLecture => Boolean(lecture.city && lecture.place && lecture.time));
};
