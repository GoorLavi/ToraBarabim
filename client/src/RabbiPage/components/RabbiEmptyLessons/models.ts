import type { LessonOccurrence } from '@torabarabim/common';

export interface RabbiEmptyLessonsProps {
  className?: string;
  rabbiName: string;
  nationwideItems: LessonOccurrence[] | undefined;
  isNationwidePending: boolean;
  isNationwideError: boolean;
}
