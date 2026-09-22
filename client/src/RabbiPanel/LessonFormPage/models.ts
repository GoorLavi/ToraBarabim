import type { LessonAudience, Weekday } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';
import type { RecurrenceKind } from '~/components/RecurrenceFields/models';

export interface LessonFormPageProps {
  className?: string;
}

export type { RecurrenceKind };

// No `rabbi` field: the rabbi form has no rabbi picker at all, since the
// rabbi is always the signed-in one (design doc, section 5).
//
// `city` is only meaningful while `venue.kind === 'address'`: a place-backed
// venue carries its own city on `venue.place`, which `PlacePicker` reads
// directly for its locked view.
export interface LessonFormState {
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

export type LessonFormField = 'recurrence' | 'startTime' | 'durationMinutes' | 'city' | 'addressName' | 'street' | 'audience';

export type LessonFormErrors = Partial<Record<LessonFormField, string>>;
