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

export interface CourseFormCoverProps {
  previewUrl: string | undefined;
  hasExistingPhoto: boolean;
  uploadStatus: PhotoPickerUploadStatus | undefined;
  failureReason: string | undefined;
  // Set once the cover has uploaded but reads below the soft floor
  // (`~/consts`): never a rejection, only a warning shown under the field.
  // Undefined on the create form, which uploads the cover only once the
  // whole course is saved and has no upload of its own to warn after;
  // `CourseFormFields.tsx`'s own `useCreateCoverWarning` covers that case
  // instead, from the picked file directly.
  warning: string | undefined;
  onRetryUpload: () => void;
  onSelectFile: (file: File) => void;
}

export interface CourseFormGalleryProps {
  photos: GalleryPhoto[];
  onAddFiles: (files: File[]) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  // The same condition that already disables the page's own save button:
  // passed straight through to `GalleryField` so its add tile takes no new
  // photos while a save is in flight either (reviewer finding L1).
  isSaving: boolean;
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
