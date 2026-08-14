const TIME_PATTERN = /(\d{1,2})[:.](\d{2})/;

const toHHMM = (hours: string, minutes: string): string | undefined => {
  const h = Number(hours);
  const m = Number(minutes);
  if (h < 0 || h > 23 || m < 0 || m > 59) return undefined;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Parses a single clock time such as "20:30" or "20.30" into 'HH:mm'.
// Returns undefined for anything outside a valid 24-hour clock rather than
// clamping it, since a clamped time is a wrong time, not a missing one.
export const parseTime = (text: string): string | undefined => {
  const match = TIME_PATTERN.exec(text);
  if (!match) return undefined;
  const [, hours, minutes] = match as unknown as [string, string, string];
  return toHHMM(hours, minutes);
};

// Parses a time range such as "20:30-21:15" or "20:30 עד 21:15" into a
// start and end. Falls back to reading a single time as the start only.
export const parseTimeRange = (text: string): { start?: string; end?: string } => {
  const [first, second] = [...text.matchAll(new RegExp(TIME_PATTERN, 'g'))];
  if (!first) return {};

  const start = toHHMM(first[1] as string, first[2] as string);
  if (!second) return { start };

  const end = toHHMM(second[1] as string, second[2] as string);
  return { start, end };
};

// Minutes between a start and end 'HH:mm', assuming the lesson does not
// cross midnight (no source we know of publishes an overnight lesson).
export const durationBetween = (start: string, end: string): number | undefined => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if (startH === undefined || startM === undefined || endH === undefined || endM === undefined) return undefined;

  const minutes = endH * 60 + endM - (startH * 60 + startM);
  return minutes > 0 ? minutes : undefined;
};

// Parses a duration given directly, e.g. "45 דקות" or "שעה".
export const parseDurationMinutes = (text: string): number | undefined => {
  const hourMatch = /שעה(?:\s*וחצי)?/.exec(text);
  if (hourMatch) return hourMatch[0].includes('וחצי') ? 90 : 60;

  const minuteMatch = /(\d+)\s*דק/.exec(text);
  if (minuteMatch) return Number(minuteMatch[1]);

  return undefined;
};
