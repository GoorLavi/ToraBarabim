import type { LessonAudience, LessonTopic, Rabbi, Weekday } from '@torabarabim/common';

import type { RecurrenceKind } from '~/components/RecurrenceFields/models';

export interface LessonFormPageProps {
  className?: string;
}

export type { RecurrenceKind };

// No venue fields at all (build brief): a lesson created here is at this
// place by definition, and the server supplies the venue from the session.
// `rabbi` replaces what the rabbi form has none of, since here the rabbi is
// the one thing that has to be chosen.
export interface LessonFormState {
  rabbi: Rabbi | undefined;
  title: string;
  recurrenceKind: RecurrenceKind;
  weekdays: Weekday[];
  date: string;
  startTime: string;
  durationMinutes: string;
  audience: LessonAudience | undefined;
  // Empty string means "not chosen", distinct from any real `LessonTopic`
  // value, since the field is optional (`Lesson.topic`) and a native
  // `<select>` needs a string value either way.
  topic: LessonTopic | '';
  notes: string;
}

export type LessonFormField = 'rabbi' | 'recurrence' | 'startTime' | 'durationMinutes' | 'audience';

export type LessonFormErrors = Partial<Record<LessonFormField, string>>;
