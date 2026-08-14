import type { LessonOccurrence, Rabbi } from '@torabarabim/common';

export interface RabbiRowProps {
  className?: string;
  items: LessonOccurrence[] | undefined;
  isLoading: boolean;
}

export type { Rabbi };
