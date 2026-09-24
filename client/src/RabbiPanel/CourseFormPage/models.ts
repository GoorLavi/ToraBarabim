import type { LessonAudience, LessonTopic } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';

export interface CourseFormPageProps {
  className?: string;
}

// The counterpart of the wire's `CourseTopic`, but never a third, partial
// state: "no topic chosen" is its own variant rather than an empty string
// standing in for it.
export type CourseTopicFormValue = { kind: 'none' } | { kind: 'set'; value: Exclude<LessonTopic, 'other'> } | { kind: 'other'; otherText: string };

// `cover` is only ever set while creating: on an existing course the cover
// is replaced through its own immediate upload (`useCourseCoverUpload.ts`),
// never carried in this state or in the PATCH body.
export interface CourseFormState {
  name: string;
  cycle: string;
  description: string;
  topic: CourseTopicFormValue;
  cover: File | undefined;
  openingDate: string;
  weeks: string;
  sessions: string;
  hours: string;
  joinableAfterOpening: boolean;
  city: SelectedCity | undefined;
  venue: LessonVenueFormState;
  audience: LessonAudience | undefined;
  contactPhone: string;
  priceShekels: string;
}

export type CourseFormField =
  | 'name'
  | 'description'
  | 'topicOther'
  | 'cycle'
  | 'cover'
  | 'openingDate'
  | 'weeks'
  | 'sessions'
  | 'hours'
  | 'city'
  | 'addressName'
  | 'street'
  | 'audience'
  | 'contactPhone'
  | 'priceShekels';

export type CourseFormErrors = Partial<Record<CourseFormField, string>>;
