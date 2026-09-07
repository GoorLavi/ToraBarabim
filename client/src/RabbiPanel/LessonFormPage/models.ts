import type { LessonAudience, Weekday } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import type { RecurrenceKind } from '~/components/RecurrenceFields/models';

export interface LessonFormPageProps {
  className?: string;
}

export type { RecurrenceKind };

// No `rabbi` field: the rabbi form has no rabbi picker at all, since the
// rabbi is always the signed-in one (design doc, section 5).
export interface LessonFormState {
  title: string;
  recurrenceKind: RecurrenceKind;
  weekdays: Weekday[];
  date: string;
  startTime: string;
  durationMinutes: string;
  city: SelectedCity | undefined;
  placeName: string;
  street: string;
  floor: string;
  audience: LessonAudience | undefined;
}

export type LessonFormField = 'recurrence' | 'startTime' | 'durationMinutes' | 'city' | 'placeName' | 'street' | 'audience';

export type LessonFormErrors = Partial<Record<LessonFormField, string>>;
