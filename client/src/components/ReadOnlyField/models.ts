export interface ReadOnlyFieldProps {
  className?: string;
  label?: string;
  value: string;
  helper?: string;
  // 'auto' (the default) is right for a name, a place, a note: anything
  // that is itself Hebrew or mixed text. A clock time like '19:30' has no
  // strong-direction character for 'auto' to key off, so a caller showing
  // one passes 'ltr' explicitly, matching how a bare start time is already
  // forced ltr elsewhere (e.g. AdminPanel/LessonsListPage).
  valueDir?: 'auto' | 'ltr';
}
