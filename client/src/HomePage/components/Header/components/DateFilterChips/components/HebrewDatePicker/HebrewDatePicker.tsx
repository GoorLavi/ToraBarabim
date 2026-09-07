import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styled from 'styled-components';

import { addDays } from '~/HomePage/helpers';

import * as consts from './consts';
import * as helpers from './helpers';
import type { DayCell, HebrewDatePickerProps, YearMonth } from './models';
import * as styles from './styles';

const chunkIntoWeeks = (cells: DayCell[]): DayCell[][] => {
  const weeks: DayCell[][] = [];
  for (let index = 0; index < cells.length; index += consts.WEEK_LENGTH) {
    weeks.push(cells.slice(index, index + consts.WEEK_LENGTH));
  }
  return weeks;
};

export const HebrewDatePicker = styled(
  ({ className, surface, selectedDate, initialMonth, todayIso, onSelectDate, onClear }: HebrewDatePickerProps) => {
    const [viewMonth, setViewMonth] = useState<YearMonth>(() => helpers.yearMonthFromIso(initialMonth));
    const [focusedIso, setFocusedIso] = useState(selectedDate ?? todayIso);
    const cellRefs = useRef(new Map<string, HTMLButtonElement>());
    const maxSelectableIso = helpers.maxSelectableIso(todayIso);

    // Runs once on mount, which is exactly "on open" since the parent only
    // mounts this component while the panel is open: the chosen day (or
    // today, when nothing is chosen) receives focus without a separate
    // effect keyed to an "isOpen" flag.
    useEffect(() => {
      cellRefs.current.get(focusedIso)?.focus();
    }, [focusedIso]);

    // The same forward bound the month-nav buttons enforce, applied here too:
    // otherwise ArrowLeft, ArrowDown, and End walk day by day past it with
    // nothing to stop them.
    const focusDate = (isoDate: string): void => {
      const clampedIso = isoDate > maxSelectableIso ? maxSelectableIso : isoDate;
      const month = helpers.yearMonthFromIso(clampedIso);
      if (!helpers.isSameYearMonth(month, viewMonth)) setViewMonth(month);
      setFocusedIso(clampedIso);
    };

    const pageMonth = (delta: -1 | 1): void => {
      if (delta === -1 && !helpers.canGoToPreviousMonth(viewMonth, todayIso)) return;
      if (delta === 1 && !helpers.canGoToNextMonth(viewMonth, todayIso)) return;

      const targetMonth = helpers.addMonths(viewMonth, delta);
      const clampedDay = Math.min(helpers.dayNumberOfIso(focusedIso), helpers.daysInMonthCount(targetMonth));
      setViewMonth(targetMonth);
      setFocusedIso(helpers.isoOfYearMonthDay(targetMonth, clampedDay));
    };

    const resetToCurrentMonth = (): void => {
      setViewMonth(helpers.yearMonthFromIso(todayIso));
      setFocusedIso(todayIso);
    };

    const activateCell = (cell: DayCell): void => {
      if (cell.status === 'selectable') onSelectDate(cell.iso);
    };

    // THE RTL TRAP: the past sits to the right and the future to the left,
    // so the arrows follow the visual direction, not the date's own order.
    // ArrowRight steps to the previous day, ArrowLeft to the next one.
    const handleCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, cell: DayCell): void => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          focusDate(addDays(cell.iso, -1));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          focusDate(addDays(cell.iso, 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusDate(addDays(cell.iso, -consts.WEEK_LENGTH));
          break;
        case 'ArrowDown':
          event.preventDefault();
          focusDate(addDays(cell.iso, consts.WEEK_LENGTH));
          break;
        case 'Home':
          event.preventDefault();
          focusDate(addDays(cell.iso, -helpers.weekdayIndexOfIso(cell.iso)));
          break;
        case 'End':
          event.preventDefault();
          focusDate(addDays(cell.iso, consts.WEEK_LENGTH - 1 - helpers.weekdayIndexOfIso(cell.iso)));
          break;
        case 'PageUp':
          event.preventDefault();
          pageMonth(-1);
          break;
        case 'PageDown':
          event.preventDefault();
          pageMonth(1);
          break;
        default:
          break;
      }
    };

    const weeks = chunkIntoWeeks(helpers.buildMonthGrid(viewMonth, todayIso, selectedDate));
    const isPreviousMonthDisabled = !helpers.canGoToPreviousMonth(viewMonth, todayIso);
    const isNextMonthDisabled = !helpers.canGoToNextMonth(viewMonth, todayIso);
    const isViewingCurrentMonth = helpers.isSameYearMonth(viewMonth, helpers.yearMonthFromIso(todayIso));
    const monthLabel = helpers.monthLabel(viewMonth);

    return (
      <div className={classNames(className, surface)}>
        <div className="header">
          <button
            type="button"
            className="navButton"
            aria-label={consts.PREVIOUS_MONTH_LABEL}
            disabled={isPreviousMonthDisabled}
            onClick={() => pageMonth(-1)}
          >
            {/* Hebrew runs right to left, so the previous month sits to the
                right and its chevron points right; the next month sits to
                the left and points left. Drawn for RTL on purpose: two
                explicit paths, never one path mirrored with scaleX(-1). */}
            <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="monthLabel">{monthLabel}</span>
          <button
            type="button"
            className="navButton"
            aria-label={consts.NEXT_MONTH_LABEL}
            disabled={isNextMonthDisabled}
            onClick={() => pageMonth(1)}
          >
            <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="weekdayRow" aria-hidden="true">
          {helpers.WEEKDAY_NARROW_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="grid" role="grid" aria-label={monthLabel}>
          {weeks.map((week, weekIndex) => (
            // A week always has seven cells (buildMonthGrid never returns a
            // short row), so the first cell's iso is the row's stable key;
            // the index fallback only exists to satisfy the type checker.
            <div className="row" role="row" key={week[0]?.iso ?? `row-${weekIndex}`}>
              {week.map((cell) => (
                <button
                  key={cell.iso}
                  type="button"
                  role="gridcell"
                  className={classNames('day', cell.status, { today: cell.isToday, selected: cell.isSelected })}
                  tabIndex={cell.iso === focusedIso ? 0 : -1}
                  aria-selected={cell.isSelected}
                  aria-disabled={cell.status === 'selectable' ? undefined : true}
                  aria-label={helpers.dayAccessibleName(cell)}
                  ref={(node) => {
                    if (node) cellRefs.current.set(cell.iso, node);
                    else cellRefs.current.delete(cell.iso);
                  }}
                  onClick={() => activateCell(cell)}
                  onKeyDown={(event) => handleCellKeyDown(event, cell)}
                >
                  <span className="mark">{cell.dayNumber}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="footer">
          <button type="button" className="footerAction" disabled={isViewingCurrentMonth} onClick={resetToCurrentMonth}>
            {consts.RESET_TO_CURRENT_MONTH_LABEL}
          </button>
          {selectedDate && (
            <button type="button" className="footerAction" onClick={onClear}>
              {consts.CLEAR_ALL_DATES_LABEL}
            </button>
          )}
        </div>
      </div>
    );
  },
)`
  ${styles.HebrewDatePicker}
`;
