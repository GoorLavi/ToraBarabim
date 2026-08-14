import { RAW_LECTURES_ARRAY_PATTERN } from './consts';
import type { OneOffLecture } from './models';

const fieldPattern = (key: string): RegExp => new RegExp(`${key}\\s*:\\s*(?:"([^"]*)"|'([^']*)')`);

const extractField = (entry: string, key: string): string | undefined => {
  const match = fieldPattern(key).exec(entry);
  const value = match?.[1] ?? match?.[2];
  return value?.trim() || undefined;
};

const parseEntry = (entry: string): OneOffLecture | undefined => {
  const dateStr = extractField(entry, 'dateStr');
  const city = extractField(entry, 'city');
  const place = extractField(entry, 'place');
  const time = extractField(entry, 'time');
  if (!dateStr || !city || !place || !time) return undefined;
  return { dateStr, city, place, time };
};

// Parses the rawLecturesData JS array literal out of the page's inline
// script. Throws if the array cannot be found or none of its entries parse,
// since a silent parse break here would look identical to the site
// currently publishing zero one-off lessons, and the snapshot diff treats
// those two cases very differently: zero real lessons deletes nothing, a
// broken parse must not.
export const parseOneOffLectures = (html: string): OneOffLecture[] => {
  const arrayMatch = RAW_LECTURES_ARRAY_PATTERN.exec(html);
  if (!arrayMatch) {
    throw new Error('levmeirisrael: could not find rawLecturesData array, the page markup may have changed');
  }

  const body = (arrayMatch[1] ?? '').trim();
  if (!body) return [];

  const entryBlocks = body.match(/\{[^{}]*\}/g) ?? [];
  if (entryBlocks.length === 0) {
    throw new Error('levmeirisrael: rawLecturesData is non-empty but contains no recognizable lesson entries');
  }

  const lectures = entryBlocks.map(parseEntry).filter((lecture): lecture is OneOffLecture => lecture !== undefined);
  if (lectures.length === 0) {
    throw new Error('levmeirisrael: found entries in rawLecturesData but none had all of dateStr, city, place, time');
  }

  return lectures;
};
