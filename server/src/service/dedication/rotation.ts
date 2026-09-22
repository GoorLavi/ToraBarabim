import { todayInIsrael } from '../lesson/israel-time';

// A local hash, deliberately separate from `service/home/home.ts`'s
// `hashLessonId`: that one is a stable secondary sort key and its own
// comment requires it to never depend on the clock, the opposite guarantee
// this hash needs. This one folds `todayInIsrael(now)` into its input on
// purpose, so the rotation changes once a day (Israel calendar) and stays
// identical across every request within that day.
const hashWithDate = (value: string, dateSeed: string): number => {
  const input = `${dateSeed}:${value}`;
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
};

export const dedicationRotationKey = (value: string, now: Date): number => hashWithDate(value, todayInIsrael(now));
