import type { Weekday } from '@torabarabim/common';

import type { RecurrenceKind } from '~/AdminPanel/LessonFormPage/models';

export interface RecurrenceFieldsProps {
  className?: string;
  recurrenceKind: RecurrenceKind;
  onSelectRecurrenceKind: (kind: RecurrenceKind) => void;
  weekdays: Weekday[];
  onToggleWeekday: (weekday: Weekday) => void;
  date: string;
  onChangeDate: (date: string) => void;
  startTime: string;
  onChangeStartTime: (startTime: string) => void;
  durationMinutes: string;
  onChangeDurationMinutes: (durationMinutes: string) => void;
  recurrenceErrorMessage: string | undefined;
  startTimeErrorMessage: string | undefined;
  durationErrorMessage: string | undefined;
}
