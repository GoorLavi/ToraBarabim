import type { DedicationGroup, HomeResponse, VisitorMessageType } from '@torabarabim/common';

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

// What a visitor has typed so far into one type's form. Strings as typed:
// trimming and normalising happen when the message is built for the wire.
export interface VisitorMessageDraft {
  name: string;
  phone: string;
  message: string;
}

export type VisitorMessageSendStatus = 'idle' | 'sending' | 'sent' | 'failed';

// The window that is open, and the tile that opened it. The element is only
// held to return focus to it on close, and only if it is still in the page.
export interface OpenHelpWindow {
  kind: VisitorMessageType;
  opener: HTMLElement;
}

// Everything the window and its tiles need, owned in one place above both:
// each type keeps its own draft and its own send state, so a draft survives
// closing the window and a refetch that moves the tile underneath it.
export interface HelpWindowState {
  openKind: VisitorMessageType | undefined;
  drafts: Record<VisitorMessageType, VisitorMessageDraft>;
  sendStatuses: Record<VisitorMessageType, VisitorMessageSendStatus>;
  open: (kind: VisitorMessageType, opener: HTMLElement) => void;
  close: () => void;
  changeDraft: (kind: VisitorMessageType, draft: VisitorMessageDraft) => void;
  send: (kind: VisitorMessageType) => void;
}
