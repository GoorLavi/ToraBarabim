import * as consts from './consts';
import type { DayCell, DayCellStatus, YearMonth } from './models';

const parseIso = (isoDate: string): Date => new Date(`${isoDate}T00:00:00Z`);

const isoFromDate = (date: Date): string => date.toISOString().slice(0, 10);

const startOfYearMonth = (yearMonth: YearMonth): Date => new Date(Date.UTC(yearMonth.year, yearMonth.month, 1));

export const yearMonthFromIso = (isoDate: string): YearMonth => {
  const date = parseIso(isoDate);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
};

export const addMonths = (yearMonth: YearMonth, delta: number): YearMonth => {
  const date = startOfYearMonth(yearMonth);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
};

export const isSameYearMonth = (a: YearMonth, b: YearMonth): boolean => a.year === b.year && a.month === b.month;

const yearMonthOrder = (yearMonth: YearMonth): number => yearMonth.year * 12 + yearMonth.month;

export const isAfterYearMonth = (a: YearMonth, b: YearMonth): boolean => yearMonthOrder(a) > yearMonthOrder(b);
export const isBeforeYearMonth = (a: YearMonth, b: YearMonth): boolean => yearMonthOrder(a) < yearMonthOrder(b);

export const canGoToPreviousMonth = (viewMonth: YearMonth, todayIso: string): boolean =>
  isAfterYearMonth(viewMonth, yearMonthFromIso(todayIso));

export const canGoToNextMonth = (viewMonth: YearMonth, todayIso: string): boolean =>
  isBeforeYearMonth(viewMonth, addMonths(yearMonthFromIso(todayIso), consts.MAX_MONTHS_AHEAD));

// The last day the grid may ever reach: the same forward bound the month-nav
// buttons already enforce, restated as a day so day-level movement (arrow
// keys, End) can be clamped to it too, rather than walking past it one day
// at a time.
export const maxSelectableIso = (todayIso: string): string => {
  const boundMonth = addMonths(yearMonthFromIso(todayIso), consts.MAX_MONTHS_AHEAD);
  return isoOfYearMonthDay(boundMonth, daysInMonthCount(boundMonth));
};

const firstWeekdayOfMonth = (yearMonth: YearMonth): number => startOfYearMonth(yearMonth).getUTCDay();

export const daysInMonthCount = (yearMonth: YearMonth): number => {
  const nextMonthStart = startOfYearMonth(addMonths(yearMonth, 1));
  nextMonthStart.setUTCDate(nextMonthStart.getUTCDate() - 1);
  return nextMonthStart.getUTCDate();
};

// A month needs all six grid rows only when its first weekday and length
// together overflow five weeks: used to pick a representative month for the
// Storybook story, since the grid itself always renders six rows regardless.
export const needsSixPopulatedRows = (yearMonth: YearMonth): boolean =>
  firstWeekdayOfMonth(yearMonth) + daysInMonthCount(yearMonth) > consts.WEEK_LENGTH * 5;

export const dayNumberOfIso = (isoDate: string): number => parseIso(isoDate).getUTCDate();

export const weekdayIndexOfIso = (isoDate: string): number => parseIso(isoDate).getUTCDay();

export const isoOfYearMonthDay = (yearMonth: YearMonth, day: number): string =>
  isoFromDate(new Date(Date.UTC(yearMonth.year, yearMonth.month, day)));

// Week starts Sunday and the grid always spans six full weeks, so paging a
// month never changes the panel's height (build spec, section 5). Cells are
// emitted Sunday-first; nothing here names a side, so the page's inherited
// RTL puts Sunday at the right for free.
export const buildMonthGrid = (viewMonth: YearMonth, todayIso: string, selectedDate: string | undefined): DayCell[] => {
  const gridStart = startOfYearMonth(viewMonth);
  gridStart.setUTCDate(gridStart.getUTCDate() - firstWeekdayOfMonth(viewMonth));

  return Array.from({ length: consts.GRID_CELL_COUNT }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setUTCDate(gridStart.getUTCDate() + index);
    const iso = isoFromDate(cellDate);
    const inViewMonth = cellDate.getUTCMonth() === viewMonth.month && cellDate.getUTCFullYear() === viewMonth.year;
    const status: DayCellStatus = !inViewMonth ? 'adjacent' : iso < todayIso ? 'past' : 'selectable';

    return {
      iso,
      dayNumber: cellDate.getUTCDate(),
      status,
      isToday: iso === todayIso,
      isSelected: status !== 'adjacent' && iso === selectedDate,
    };
  });
};

const monthLabelFormatter = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const monthLabel = (yearMonth: YearMonth): string => monthLabelFormatter.format(startOfYearMonth(yearMonth));

const weekdayNarrowFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'narrow', timeZone: 'UTC' });

// 2023-01-01 fell on a Sunday in UTC: an arbitrary but fixed anchor, since
// the letters only depend on which weekday a date falls on.
const SUNDAY_ANCHOR = new Date(Date.UTC(2023, 0, 1));

export const WEEKDAY_NARROW_LABELS: string[] = Array.from({ length: consts.WEEK_LENGTH }, (_, index) => {
  const date = new Date(SUNDAY_ANCHOR);
  date.setUTCDate(SUNDAY_ANCHOR.getUTCDate() + index);
  return weekdayNarrowFormatter.format(date);
});

const dayAccessibleNameFormatter = new Intl.DateTimeFormat('he-IL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const dayAccessibleName = (cell: DayCell): string => {
  const base = dayAccessibleNameFormatter.format(parseIso(cell.iso));
  return cell.isToday ? `${base}${consts.TODAY_SUFFIX}` : base;
};
