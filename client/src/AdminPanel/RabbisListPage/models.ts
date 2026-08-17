import type { Rabbi } from '@torabarabim/common';

export interface RabbisListPageProps {
  className?: string;
}

export interface AdminRabbiRow {
  rabbi: Rabbi;
  lessonCount: number;
}
