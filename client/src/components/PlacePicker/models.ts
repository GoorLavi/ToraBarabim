import type { Area } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';

// Everything this picker itself ever shows or submits about a chosen place:
// the fields a `Place` search result carries, minus `lessonCount` (a public
// place-page stat this control has no use for), plus whether it is
// currently active. A named interface rather than `Pick<Place, ...> &
// {isActive}` so it stays exactly this shape regardless of what `Place`
// itself grows next. Every place a fresh search or a duplicate-hint match
// returns is active by construction (`GET /v1/places` and
// `GET /v1/places/similar` never list an inactive one), so `isActive` is
// only ever `false` for a place resolved from an already-saved lesson
// (State C).
export interface PickedPlace {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor?: string;
  city: string;
  citySlug: string;
  area: Area;
  photoUrl?: string;
  isActive: boolean;
}

// A lesson's venue as this form edits it: a registered place, or a
// free-text address. The counterpart of the wire's `LessonVenueInput`, but
// never a third, partial state: "nothing chosen yet" is just the address
// arm with blank fields.
export type LessonVenueFormState =
  | { kind: 'place'; place: PickedPlace }
  | { kind: 'address'; name: string; street: string; floor: string };

export interface PlacePickerProps {
  className?: string;
  venue: LessonVenueFormState;
  onChangeVenue: (venue: LessonVenueFormState) => void;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity | undefined) => void;
  cityError: string | undefined;
  nameError: string | undefined;
  streetError: string | undefined;
}
