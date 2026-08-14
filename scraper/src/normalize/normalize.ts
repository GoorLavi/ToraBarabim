import type { City, Recurrence } from '@torabarabim/common';

import type { RawLesson } from '../adapters/models';
import { parseAudience, parseTopic } from './audience-topic';
import { resolveCity } from './city';
import { parseDate } from './date';
import type { CollectedLesson, GapField } from './models';
import { splitPlace } from './place';
import { durationBetween, parseDurationMinutes, parseTime } from './time';
import { parseWeekday } from './weekday';

const resolveRecurrence = (
  raw: RawLesson,
  referenceIsoDate: string,
): { recurrence?: Recurrence; gap: boolean } => {
  if (raw.dateRaw) {
    const date = parseDate(raw.dateRaw, referenceIsoDate);
    return date ? { recurrence: { kind: 'once', date }, gap: false } : { gap: true };
  }

  if (raw.weekdayRaw) {
    const weekday = parseWeekday(raw.weekdayRaw);
    return weekday !== undefined ? { recurrence: { kind: 'weekly', weekdays: [weekday] }, gap: false } : { gap: true };
  }

  return { gap: true };
};

// Converts one RawLesson into the shared domain vocabulary. Pure: every
// input it needs (the reference date a yearless date resolves against, the
// city list) is passed in, so it needs no network call to be exercised.
export const normalizeLesson = (sourceId: string, raw: RawLesson, cities: City[], referenceIsoDate: string): CollectedLesson => {
  const gaps: GapField[] = [];

  const title = raw.titleRaw?.trim() || undefined;
  if (!title) gaps.push('title');

  const topic = raw.topicRaw ? parseTopic(raw.topicRaw) : undefined;
  if (!topic) gaps.push('topic');

  const audience = raw.audienceRaw ? parseAudience(raw.audienceRaw) : undefined;
  if (!audience) gaps.push('audience');

  const rabbiName = raw.rabbiNameRaw?.trim() || undefined;
  if (!rabbiName) gaps.push('rabbiName');

  const { name: placeName, address } = raw.placeRaw ? splitPlace(raw.placeRaw) : {};
  if (!placeName) gaps.push('placeName');
  if (!address) gaps.push('address');

  const cityMatch = raw.cityRaw ? resolveCity(raw.cityRaw, cities) : undefined;
  if (!cityMatch) gaps.push('city');

  const { recurrence, gap: recurrenceGap } = resolveRecurrence(raw, referenceIsoDate);
  if (recurrenceGap) gaps.push('recurrence');

  const startTime = raw.startTimeRaw ? parseTime(raw.startTimeRaw) : undefined;
  if (!startTime) gaps.push('startTime');

  const endTime = raw.endTimeRaw ? parseTime(raw.endTimeRaw) : undefined;
  if (!endTime) gaps.push('endTime');

  const durationMinutes = raw.durationRaw
    ? parseDurationMinutes(raw.durationRaw)
    : startTime && endTime
      ? durationBetween(startTime, endTime)
      : undefined;
  if (durationMinutes === undefined) gaps.push('durationMinutes');

  return {
    key: `${sourceId}:${raw.sourceItemId}`,
    sourceId,
    sourceItemId: raw.sourceItemId,
    collectedAt: new Date().toISOString(),
    title,
    topic,
    audience,
    rabbiName,
    place: { name: placeName, address, cityName: cityMatch?.name, area: cityMatch?.area },
    recurrence,
    startTime,
    endTime,
    durationMinutes,
    notes: raw.notesRaw?.trim() || undefined,
    gaps,
  };
};
