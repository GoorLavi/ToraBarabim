export interface YearMonth {
  year: number;
  month: number;
}

// A day cell is exactly one of these, never a bag of booleans: an adjacent
// day is never selectable and a past day is never adjacent-and-selectable
// at once (root CLAUDE.md, "make illegal states unrepresentable").
export type DayCellStatus = 'adjacent' | 'past' | 'selectable';

export interface DayCell {
  iso: string;
  dayNumber: number;
  status: DayCellStatus;
  isToday: boolean;
  isSelected: boolean;
}

// The sheet gives its title row, month-nav row and footer an extra inset
// beyond the panel's own padding, so the day grid can stay flush with the
// edge while the surrounding rows keep normal breathing room (build spec,
// section 8, "Sheet panel"). The popover applies its inset uniformly and
// needs no such distinction.
export type HebrewDatePickerSurface = 'sheet' | 'popover';

export interface HebrewDatePickerProps {
  className?: string;
  surface: HebrewDatePickerSurface;
  selectedDate: string | undefined;
  initialMonth: string;
  todayIso: string;
  onSelectDate: (isoDate: string) => void;
  onClear: () => void;
}
