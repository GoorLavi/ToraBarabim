import type { DedicationGroup, HelpRequestType, HomeResponse } from '@torabarabim/common';

import type { VisitorMessageDraft, VisitorMessageSendStatus } from '~/components/HelpWindow/models';
import type { HomeApiError } from '~/HomePage/api';

// The slice of TanStack Query's `UseQueryResult` this component actually
// reads, the same narrowing `LessonsSection` uses so a story can hand it a
// plain object instead of a real query client.
export interface HomeRowsQueryState {
  isPending: boolean;
  isError: boolean;
  data: HomeResponse | undefined;
  error: HomeApiError | null;
  refetch: () => void;
}

export interface HomeRailsProps {
  className?: string;
  query: HomeRowsQueryState;
  // The `success` and `healing` groups, each fixed to its own slot here
  // (consts.ts), prop-drilled by one level rather than read again. Each is
  // `undefined` when the pool has no dedications of that type.
  successGroup: DedicationGroup | undefined;
  healingGroup: DedicationGroup | undefined;
}

// The window that is open, and the tile that opened it. The element is only
// held to return focus to it on close, and only if it is still in the page.
export interface OpenHelpWindow {
  kind: HelpRequestType;
  opener: HTMLElement;
}

// Everything the window and its tiles need, owned in one place above both:
// each type keeps its own draft and its own send state, so a draft survives
// closing the window and a refetch that moves the tile underneath it.
export interface HelpWindowState {
  openKind: HelpRequestType | undefined;
  drafts: Record<HelpRequestType, VisitorMessageDraft>;
  sendStatuses: Record<HelpRequestType, VisitorMessageSendStatus>;
  open: (kind: HelpRequestType, opener: HTMLElement) => void;
  close: () => void;
  changeDraft: (kind: HelpRequestType, draft: VisitorMessageDraft) => void;
  send: (kind: HelpRequestType) => void;
}
