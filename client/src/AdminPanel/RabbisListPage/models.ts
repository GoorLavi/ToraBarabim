import type { Rabbi } from '@torabarabim/common';

import type { AdminApiError } from '~/AdminPanel/api';

export interface RabbisListPageProps {
  className?: string;
}

export interface AdminRabbiRow {
  rabbi: Rabbi;
  lessonCount: number;
}

// `appliedSearch` is the term the rows actually answer, which the debounce
// leaves a beat behind what is in the field. The empty state has to branch
// on it rather than on the live term, or clearing a search that matched
// nothing offers "add the first rabbi" for that beat, on a system that is
// full of them.
export type AdminRabbisListState =
  | { status: 'pending' }
  | { status: 'error'; error: AdminApiError; retry: () => void }
  | { status: 'success'; rows: AdminRabbiRow[]; total: number; appliedSearch: string };
