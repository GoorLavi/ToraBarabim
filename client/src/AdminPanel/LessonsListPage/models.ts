import type { LessonResponse, Rabbi, RabbiHonorific } from '@torabarabim/common';

import type { SelectedCity } from '~/components/CitySelect/models';

export interface LessonsListPageProps {
  className?: string;
}

// 'all' is a client-side UI state, never sent to the server: an absent
// filter means "do not narrow" (server/CLAUDE.md, Search Behavior), and the
// wire query only ever carries `cityId`.
export type RecurrenceFilter = 'all' | 'weekly' | 'once';

// Enough to filter by `rabbiId` and to render the chip through
// `rabbiDisplayName`, which needs the honorific alongside the name (root
// CLAUDE.md: a rabbi's name is never shown bare).
export interface RabbiFilterValue {
  id: string;
  name: string;
  honorific: RabbiHonorific;
}

export interface LessonListUrlFilters {
  city: SelectedCity | undefined;
  rabbi: RabbiFilterValue | undefined;
  recurrence: RecurrenceFilter;
  search: string;
}

export interface AdminLessonRow {
  lesson: LessonResponse;
  rabbi: Rabbi | undefined;
}
