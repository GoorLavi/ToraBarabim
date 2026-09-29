import type { CloseReason, CourseStatus } from '@torabarabim/common';

import { addDays, compareIsoDates, todayInIsrael } from '../lesson/israel-time';
import { CLOSED_WEEK_DAYS } from './consts';

export interface CourseLifecycleInput {
  openingDate: string;
  weeks: number;
  joinableAfterOpening: boolean;
  registrationClosedAt: Date | null;
  closeReason: CloseReason | null;
}

export type CourseLifecycleResult =
  | { status: 'notOpen'; closesOn: string; isListed: true; leavesListsOn: string }
  | { status: 'open'; closesOn: string; isListed: true; leavesListsOn: string }
  | { status: 'closed'; reason: CloseReason; closedOn: string; leavesListsOn: string; isListed: boolean };

// Pure: `today` is passed in (from `todayInIsrael`), nothing here reads the
// clock. A non-joinable course closes on its own opening day; a joinable one
// closes at opening + 7 * weeks days; a manual close (by hand or marked
// full) can only bring that date earlier, never later, since a route only
// ever writes `registrationClosedAt` once, while it is still NULL.
export const courseLifecycle = (course: CourseLifecycleInput, today: string): CourseLifecycleResult => {
  const autoClosedOn = course.joinableAfterOpening ? addDays(course.openingDate, 7 * course.weeks) : course.openingDate;

  // `registrationClosedAt` is a timestamp; it is converted to an Israel
  // calendar date once here, so the closed week never shifts by a day
  // around a UTC midnight crossing.
  const manualClosedOn = course.registrationClosedAt ? todayInIsrael(course.registrationClosedAt) : undefined;
  const closedByHand = manualClosedOn !== undefined && compareIsoDates(manualClosedOn, autoClosedOn) <= 0;
  const closedOn = closedByHand ? (manualClosedOn as string) : autoClosedOn;
  const leavesListsOn = addDays(closedOn, CLOSED_WEEK_DAYS);
  const isListed = compareIsoDates(today, leavesListsOn) < 0;

  if (compareIsoDates(today, closedOn) < 0) {
    const status: CourseStatus = compareIsoDates(today, course.openingDate) < 0 ? 'notOpen' : 'open';
    return { status, closesOn: closedOn, isListed: true, leavesListsOn };
  }

  // The calendar close carries no stored reason and always reads as
  // 'closed'; only a close that was actually triggered by hand (or by the
  // full action) surfaces the reason that was recorded for it.
  const reason: CloseReason = closedByHand ? (course.closeReason ?? 'closed') : 'closed';
  return { status: 'closed', reason, closedOn, leavesListsOn, isListed };
};
