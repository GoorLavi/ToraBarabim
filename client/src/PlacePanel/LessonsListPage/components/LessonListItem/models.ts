import type { PlaceLessonResponse, Rabbi } from '@torabarabim/common';

export interface LessonListItemProps {
  className?: string;
  lesson: PlaceLessonResponse;
  // Undefined while the rabbi directory is still loading, or if this
  // lesson's `rabbiId` falls outside what `useRabbiDirectory` could read
  // (see its own comment): the tag is simply omitted rather than showing a
  // guess.
  rabbi: Rabbi | undefined;
}
