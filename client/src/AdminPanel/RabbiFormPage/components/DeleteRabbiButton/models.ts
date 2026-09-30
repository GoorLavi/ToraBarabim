import type { RabbiHonorific } from '@torabarabim/common';

export interface DeleteRabbiButtonProps {
  className?: string;
  rabbiId: string;
  honorific: RabbiHonorific;
  onDeleted: () => void;
}
