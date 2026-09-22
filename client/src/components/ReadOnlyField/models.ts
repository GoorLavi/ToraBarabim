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
}
