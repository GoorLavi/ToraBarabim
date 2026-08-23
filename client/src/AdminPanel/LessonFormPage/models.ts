import type { LessonAudience, Rabbi, Weekday } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import type { RecurrenceKind } from '~/components/RecurrenceFields/models';

export interface LessonFormPageProps {
  className?: string;
}

export type { RecurrenceKind };

// Decoupled from the wire's `Recurrence` discriminated union so the form
// can hold a half-filled 'weekly' draft (no weekdays picked yet) without
// that draft being a legal `Recurrence` value; `helpers.ts` maps this to
// the real union only at submit time.
export interface LessonFormState {
  rabbi: Rabbi | undefined;
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

export type LessonFormField = 'rabbi' | 'recurrence' | 'startTime' | 'durationMinutes' | 'city' | 'placeName' | 'street' | 'audience';

export type LessonFormErrors = Partial<Record<LessonFormField, string>>;
