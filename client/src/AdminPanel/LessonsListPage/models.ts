import type { Lesson, Place, Rabbi } from '@torabarabim/common';

import type { SelectedCity } from '~/AdminPanel/components/CitySelect/models';

export interface LessonsListPageProps {
  className?: string;
}

// 'all' is a client-side UI state, never sent to the server: an absent
// filter means "do not narrow" (server/CLAUDE.md, Search Behavior), and the
// wire query only ever carries `cityId`.
export type RecurrenceFilter = 'all' | 'weekly' | 'once';

export interface LessonListUrlFilters {
  city: SelectedCity | undefined;
  recurrence: RecurrenceFilter;
  search: string;
}

export interface AdminLessonRow {
  lesson: Lesson;
  rabbi: Rabbi | undefined;
  place: Place | undefined;
}
