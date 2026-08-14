import { addDays, todayInIsrael, weekdayOfIsoDate } from '../date-utils';
import { SCHEDULE_HOUR, SCHEDULE_TIME_ZONE, SCHEDULE_WEEKDAY } from './consts';

const israelHour = (instant: Date): number =>
  Number(
    new Intl.DateTimeFormat('en-US', { timeZone: SCHEDULE_TIME_ZONE, hour: '2-digit', hour12: false }).format(
      instant,
    ),
  );

// Minutes to add to a UTC instant so that it reads as that same instant's
// wall-clock hour in Israel. Recomputed per call rather than assumed
// constant, since Israel's UTC offset changes across the DST boundary.
const israelOffsetMinutes = (instant: Date): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHEDULE_TIME_ZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const get = (type: string): number => Number(parts.find((part) => part.type === type)?.value);
  const asIfUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asIfUtc - instant.getTime()) / 60000);
};

// The next instant that is SCHEDULE_WEEKDAY at SCHEDULE_HOUR:00 Israel
// time, strictly after `now`.
export const nextScheduledRun = (now: Date): Date => {
  const todayIso = todayInIsrael(now);
  const todayWeekday = weekdayOfIsoDate(todayIso);
  const currentHour = israelHour(now);

  let daysAhead = (SCHEDULE_WEEKDAY - todayWeekday + 7) % 7;
  if (daysAhead === 0 && currentHour >= SCHEDULE_HOUR) daysAhead = 7;

  const targetDateIso = addDays(todayIso, daysAhead);
  const naiveUtcGuess = new Date(`${targetDateIso}T${String(SCHEDULE_HOUR).padStart(2, '0')}:00:00Z`);
  const offsetMinutes = israelOffsetMinutes(naiveUtcGuess);
  return new Date(naiveUtcGuess.getTime() - offsetMinutes * 60000);
};
