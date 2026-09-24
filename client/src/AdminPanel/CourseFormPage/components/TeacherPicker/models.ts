import type { Rabbi } from '@torabarabim/common';

// The counterpart of the wire's `CourseTeacherInput`, with no third,
// unset state: the free-text arm with a blank name is "nothing chosen yet",
// the same convention `PlacePicker`'s own `LessonVenueFormState` uses for a
// venue.
export type TeacherFormValue = { kind: 'rabbi'; rabbi: Rabbi } | { kind: 'named'; name: string };

export interface TeacherPickerProps {
  className?: string;
  teacher: TeacherFormValue;
  onChangeTeacher: (teacher: TeacherFormValue) => void;
  errorMessage: string | undefined;
}
