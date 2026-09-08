import type { FilterControlsProps } from '../../models';

export interface PinnedHeaderBarProps extends Omit<FilterControlsProps, 'className'> {
  className?: string;
  isVisible: boolean;
}
