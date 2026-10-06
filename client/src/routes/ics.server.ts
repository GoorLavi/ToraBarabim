import { calendarUtcStamp } from '~/lessonCalendar/helpers';

import {
  ICS_CONTINUATION_MAX_CONTENT_OCTETS,
  ICS_LINE_BREAK,
  ICS_MAX_LINE_OCTETS,
  ICS_PRODUCT_ID,
  ICS_SEQUENCE_EPOCH_MS,
  MS_PER_MINUTE,
} from './consts';
import type { IcsEntry, IcsFeedHeader } from './models';

// RFC 5545 3.3.11: backslash, semicolon, comma and a line break are the four
// characters a TEXT value cannot carry bare.
export const escapeIcsText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n');

// Folds at the octet limit without ever cutting a UTF-8 sequence in two:
// Hebrew letters are two octets each, so counting characters instead of
// octets would overrun the limit, and cutting at an octet would leave half a
// letter on each line, which a calendar app shows as garbage.
export const foldIcsLine = (line: string): string => {
  const segments: string[] = [];
  let segment = '';
  let segmentOctets = 0;
  let maxOctets = ICS_MAX_LINE_OCTETS;

  for (const character of line) {
    const characterOctets = Buffer.byteLength(character, 'utf8');
    if (segmentOctets + characterOctets > maxOctets) {
      segments.push(segment);
      segment = '';
      segmentOctets = 0;
      maxOctets = ICS_CONTINUATION_MAX_CONTENT_OCTETS;
    }
    segment += character;
    segmentOctets += characterOctets;
  }
  segments.push(segment);

  return segments.join(`${ICS_LINE_BREAK} `);
};

const textLine = (name: string, value: string): string => foldIcsLine(`${name}:${escapeIcsText(value)}`);

// A URI value is not TEXT: escaping it would corrupt the link.
const uriLine = (name: string, value: string): string => foldIcsLine(`${name}:${value}`);

const sequenceOf = (revisedAt: Date): number => Math.max(0, Math.floor((revisedAt.getTime() - ICS_SEQUENCE_EPOCH_MS) / MS_PER_MINUTE));

const eventLines = ({ event, stampedAt, revisedAt }: IcsEntry): string[] => [
  'BEGIN:VEVENT',
  textLine('UID', event.uid),
  `DTSTAMP:${calendarUtcStamp(stampedAt)}`,
  ...(revisedAt ? [`LAST-MODIFIED:${calendarUtcStamp(revisedAt)}`, `SEQUENCE:${sequenceOf(revisedAt)}`] : []),
  `DTSTART:${calendarUtcStamp(event.startUtc)}`,
  `DTEND:${calendarUtcStamp(event.endUtc)}`,
  textLine('SUMMARY', event.summary),
  ...(event.location ? [textLine('LOCATION', event.location)] : []),
  textLine('DESCRIPTION', event.description),
  uriLine('URL', event.url),
  `STATUS:${event.isCancelled ? 'CANCELLED' : 'CONFIRMED'}`,
  'END:VEVENT',
];

const feedHeaderLines = ({ name, refreshIntervalHours }: IcsFeedHeader): string[] => [
  textLine('X-WR-CALNAME', name),
  `X-PUBLISHED-TTL:PT${refreshIntervalHours}H`,
  `REFRESH-INTERVAL;VALUE=DURATION:PT${refreshIntervalHours}H`,
];

// An empty `entries` is a valid calendar: the feed relies on it to clear a
// subscriber's calendar of a lesson that no longer exists.
export const serializeCalendar = (entries: IcsEntry[], feedHeader?: IcsFeedHeader): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${ICS_PRODUCT_ID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...(feedHeader ? feedHeaderLines(feedHeader) : []),
    ...entries.flatMap(eventLines),
    'END:VCALENDAR',
  ];
  return `${lines.join(ICS_LINE_BREAK)}${ICS_LINE_BREAK}`;
};
