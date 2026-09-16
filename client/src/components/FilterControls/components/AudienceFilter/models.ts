import type { AudienceFilter } from '@torabarabim/common';

export interface AudienceFilterProps {
  className?: string;
  filter: AudienceFilter | undefined;
  onSelectFilter: (filter: AudienceFilter) => void;
  onClearFilter: () => void;
}

// The fourth dropdown option, alongside 'all' and the two `AudienceFilter`
// values: never stored in the URL as an `AudienceFilter` (server-side
// `AudienceFilter` never accepts 'women', per common/src/lesson.ts), and
// picking it navigates away instead of setting a filter.
export type AudienceOption = 'all' | AudienceFilter | 'women';
