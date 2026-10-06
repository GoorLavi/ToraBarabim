import type { LessonOccurrence, LessonVenue } from '@torabarabim/common';

import { AUDIENCE_LABELS, LESSON_TOPIC_LABELS, RIGHT_TO_LEFT_MARK } from '~/consts';
import { addOneDay, israelDateTime, lessonPath, rabbiDisplayName } from '~/helpers';

import { SITE_ORIGIN } from '../../consts';

import * as consts from './consts';
import type { CalendarEvent, CalendarEventKind } from './models';

// The name a person recognises the venue by. `LessonVenue.name` is required
// on both arms, but a hand-typed address may carry a blank one; its street
// stands in. Shared with the share text's venue line so the two never name a
// venue differently.
export const venueNameOrStreet = (venue: Pick<LessonVenue, 'name' | 'street'>): string => venue.name.trim() || venue.street.trim();

// Name, street, city, each once and only when present. Floor is left out:
// it is an arrival note a map cannot geocode.
const locationOf = (venue: LessonVenue): string => {
  const parts = [venue.name.trim(), venue.street.trim(), venue.city.trim()].filter(Boolean);
  return parts.filter((part, index) => part !== parts[index - 1]).join(', ');
};

const taggedUrl = (path: string, kind: CalendarEventKind): string => {
  const params = new URLSearchParams({ utm_source: consts.CALENDAR_UTM_SOURCE, utm_medium: consts.CALENDAR_UTM_MEDIUMS[kind] });
  return `${SITE_ORIGIN}${path}?${params.toString()}`;
};

// "{title or שיעור} עם {rabbi}": the lesson as one line, shared by the event's
// summary, the share text and the report window's context.
export const lessonHeadline = (occurrence: Pick<LessonOccurrence, 'title'>, teachingRabbiName: string): string =>
  consts.headlineLabel(occurrence.title?.trim() || consts.DEFAULT_EVENT_TITLE, teachingRabbiName);

// Empty for a lesson open to both audiences: it adds nothing to its own title.
export const audienceSuffixOf = (audience: LessonOccurrence['audience']): string =>
  audience === 'mixed' ? '' : `, ${consts.AUDIENCE_SUMMARY_SUFFIXES[audience]}`;

const summaryOf = (occurrence: LessonOccurrence, teachingRabbiName: string): string => {
  const prefix = occurrence.status === 'cancelled' ? consts.CANCELLED_SUMMARY_PREFIX : '';
  return `${prefix}${lessonHeadline(occurrence, teachingRabbiName)}${audienceSuffixOf(occurrence.audience)}`;
};

const rtlLine = (line: string): string => `${RIGHT_TO_LEFT_MARK}${line}`;

const descriptionOf = (occurrence: LessonOccurrence, teachingRabbiName: string, lessonUrl: string, siteUrl: string, kind: CalendarEventKind): string => {
  const detailLines = [
    teachingRabbiName,
    occurrence.audience === 'mixed' ? undefined : `${consts.AUDIENCE_LINE_PREFIX}${AUDIENCE_LABELS[occurrence.audience]}`,
    occurrence.topic ? `${consts.TOPIC_LINE_PREFIX}${LESSON_TOPIC_LABELS[occurrence.topic]}` : undefined,
    occurrence.note?.trim(),
  ]
    .filter((line): line is string => Boolean(line))
    .map(rtlLine);

  const blocks = [
    detailLines,
    [rtlLine(consts.LESSON_LINK_LABEL), lessonUrl],
    [rtlLine(consts.SITE_LINK_LABEL), siteUrl],
    ...(kind === 'static' ? [[rtlLine(consts.STATIC_EVENT_DISCLAIMER)]] : []),
  ];
  return blocks.map((lines) => lines.join('\n')).join('\n\n');
};

// The end rolls to the next day when its clock time is not after the start,
// so a lesson that runs past midnight never ends before it begins.
export const calendarEventOf = (occurrence: LessonOccurrence, kind: CalendarEventKind): CalendarEvent => {
  const teachingRabbiName = rabbiDisplayName(occurrence.substituteRabbi ?? occurrence.rabbi);
  const lessonUrl = taggedUrl(lessonPath(occurrence), kind);
  const endDate = occurrence.endTime <= occurrence.startTime ? addOneDay(occurrence.date) : occurrence.date;

  return {
    uid: `${occurrence.lessonId}-${occurrence.date}@${consts.CALENDAR_SITE_HOST}`,
    startUtc: new Date(israelDateTime(occurrence.date, occurrence.startTime)),
    endUtc: new Date(israelDateTime(endDate, occurrence.endTime)),
    summary: summaryOf(occurrence, teachingRabbiName),
    location: locationOf(occurrence.venue),
    description: descriptionOf(occurrence, teachingRabbiName, lessonUrl, taggedUrl('/', kind), kind),
    url: lessonUrl,
    isCancelled: occurrence.status === 'cancelled',
  };
};

// "20261013T173000Z", the basic UTC form both iCalendar and Google Calendar's
// `dates` parameter read.
export const calendarUtcStamp = (instant: Date): string => instant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export const googleCalendarHref = (event: CalendarEvent): string => {
  const fields: Array<[string, string]> = [
    ['action', 'TEMPLATE'],
    ['text', event.summary],
    ['dates', `${calendarUtcStamp(event.startUtc)}/${calendarUtcStamp(event.endUtc)}`],
    ['details', event.description],
    ['location', event.location],
  ];
  const query = fields.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `${consts.GOOGLE_CALENDAR_RENDER_URL}?${query}`;
};

// The subscribed feed's path, one per lesson. A contract with every
// subscriber's calendar: it is never renamed.
export const lessonCalendarFeedPath = (lessonId: string): string => `/lesson/${encodeURIComponent(lessonId)}/calendar.ics`;

// `webcal://` is what makes a phone offer to subscribe instead of download.
export const lessonCalendarWebcalUrl = (lessonId: string): string => `webcal://${consts.CALENDAR_SITE_HOST}${lessonCalendarFeedPath(lessonId)}`;

// Google Calendar subscribes by a `cid` that is itself the feed's webcal URL,
// so the whole URL is one encoded query value.
export const lessonCalendarGoogleSubscribeHref = (lessonId: string): string =>
  `${consts.GOOGLE_CALENDAR_RENDER_URL}?cid=${encodeURIComponent(lessonCalendarWebcalUrl(lessonId))}`;

export const lessonEventFilePath = (occurrence: Pick<LessonOccurrence, 'lessonId' | 'date'>): string =>
  `/lesson/${encodeURIComponent(occurrence.lessonId)}/${encodeURIComponent(occurrence.date)}/event.ics`;
