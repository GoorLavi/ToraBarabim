import type { VisitorMessageStatusFilter } from '@torabarabim/common';

export interface MessagesListPageProps {
  className?: string;
}

export interface MessageListFilterState {
  status: VisitorMessageStatusFilter;
  select: (status: VisitorMessageStatusFilter) => void;
}
