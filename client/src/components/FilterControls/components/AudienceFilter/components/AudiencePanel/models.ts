import type { AudienceFilter } from '@torabarabim/common';

import type { AudienceOption } from '../../models';

export interface AudiencePanelProps {
  className?: string;
  isDrawer: boolean;
  isWide: boolean;
  filter: AudienceFilter | undefined;
  isWomenPage: boolean;
  onSelectOption: (option: AudienceOption) => void;
  onClose: () => void;
}
