import type { LessonAudience, Rabbi, Weekday } from '@torabarabim/common';

import type { SelectedCity } from '~/AdminPanel/components/CitySelect/models';

export interface LessonFormPageProps {
  className?: string;
}

export type RecurrenceKind = 'weekly' | 'once';

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
  placeAddress: string;
  audience: LessonAudience | undefined;
}

export type LessonFormField = 'rabbi' | 'recurrence' | 'startTime' | 'durationMinutes' | 'city' | 'placeName' | 'placeAddress' | 'audience';

export type LessonFormErrors = Partial<Record<LessonFormField, string>>;
