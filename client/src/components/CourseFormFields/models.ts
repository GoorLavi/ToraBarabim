import type { LessonAudience, LessonTopic } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';
import type { GalleryPhoto } from '~/components/GalleryField/models';
import type { LessonVenueFormState } from '~/components/PlacePicker/models';
import type { PhotoPickerUploadStatus } from '~/components/PhotoPicker/models';

// The counterpart of the wire's `CourseTopic`, but never a third, partial
// state: "no topic chosen" is its own variant rather than an empty string
// standing in for it.
export type CourseTopicFormValue = { kind: 'none' } | { kind: 'set'; value: Exclude<LessonTopic, 'other'> } | { kind: 'other'; otherText: string };

// Shared by both course forms (the rabbi's own and the admin's): every
// field neither the teacher section nor the page chrome around it owns.
// `cover` is only ever set while creating: on an existing course the cover
// is replaced through its own immediate upload, never carried in this
// state or in the PATCH body.
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
  | 'cover'
  | 'openingDate'
  | 'weeks'
  | 'sessions'
  | 'city'
  | 'addressName'
  | 'street'
  | 'audience'
  | 'contactPhone'
  | 'priceShekels';

export type CourseFormErrors = Partial<Record<CourseFormField, string>>;

export interface CourseFormCoverProps {
  previewUrl: string | undefined;
  hasExistingPhoto: boolean;
  uploadStatus: PhotoPickerUploadStatus | undefined;
  onRetryUpload: () => void;
  onSelectFile: (file: File) => void;
}

export interface CourseFormGalleryProps {
  photos: GalleryPhoto[];
  onAddFiles: (files: File[]) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface CourseFormFieldsProps {
  className?: string;
  form: CourseFormState;
  onChangeForm: (updater: (prev: CourseFormState) => CourseFormState) => void;
  fieldErrors: CourseFormErrors;
  // Locked to "נשים" and shown as a fixed value rather than a picker: a
  // rabbanit's own course on the rabbi form, or a course the admin is
  // giving a rabbanit teacher.
  isAudienceLocked: boolean;
  cityError: string | undefined;
  cover: CourseFormCoverProps;
  gallery: CourseFormGalleryProps;
}
