import type { LessonAudience, Rabbi, Weekday } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';
import type { RecurrenceKind } from '~/components/RecurrenceFields/models';

export interface LessonFormPageProps {
  className?: string;
}

export type { RecurrenceKind };

// Decoupled from the wire's `Recurrence` discriminated union so the form
// can hold a half-filled 'weekly' draft (no weekdays picked yet) without
// that draft being a legal `Recurrence` value; `helpers.ts` maps this to
// the real union only at submit time.
//
// `city` is only meaningful while `venue.kind === 'address'`: a place-backed
// venue carries its own city on `venue.place`, so `PlacePicker` never reads
// this field to render its locked view. It stays a sibling of `venue`
// rather than folding into the address arm because `CitySelect` (unlike the
// picker's search) is a control this page still owns directly.
export interface LessonFormState {
  rabbi: Rabbi | undefined;
  title: string;
  recurrenceKind: RecurrenceKind;
  weekdays: Weekday[];
  date: string;
  startTime: string;
  durationMinutes: string;
  city: SelectedCity | undefined;
  venue: LessonVenueFormState;
  audience: LessonAudience | undefined;
}

export type LessonFormField = 'rabbi' | 'recurrence' | 'startTime' | 'durationMinutes' | 'city' | 'addressName' | 'street' | 'audience';

export type LessonFormErrors = Partial<Record<LessonFormField, string>>;
