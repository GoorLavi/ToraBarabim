export interface ReadOnlyFieldProps {
  className?: string;
  label?: string;
  value: string;
  helper?: string;
  // A locked value should read quieter than an editable field, not louder
  // (design gate finding, PlacePicker nits): opt-in so every other caller
  // (RabbiFormPage, LessonFormPage, RabbiPanel/ProfilePage) keeps its
  // current, unreviewed weight.
  quiet?: boolean;
  // Fixed for a value that is always one direction whatever its first
  // character, such as a URL (`ltr`). Left out, the value resolves its own.
  dir?: 'auto' | 'ltr' | 'rtl';
}
