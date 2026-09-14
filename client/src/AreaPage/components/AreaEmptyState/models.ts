import type { AreaSummary } from '@torabarabim/common';

export interface AreaEmptyStateProps {
  className?: string;
  areaName: string;
  otherAreas: AreaSummary[] | undefined;
  isOtherAreasPending: boolean;
  isOtherAreasError: boolean;
}
