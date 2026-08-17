import type { LessonAudience } from '@torabarabim/common';

export interface AudiencePickerProps {
  className?: string;
  audience: LessonAudience | undefined;
  onSelectAudience: (audience: LessonAudience) => void;
  errorMessage: string | undefined;
}
