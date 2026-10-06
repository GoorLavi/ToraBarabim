import type { VisitorMessageType } from '@torabarabim/common';

import type { VisitorMessageDraft, VisitorMessageSendStatus } from '~/HomePage/components/HomeRails/models';

export interface HelpWindowProps {
  className?: string;
  // Which tile opened the window: it sets the copy and, on submit, the type
  // the message is stored under. A visitor is never asked.
  kind: VisitorMessageType;
  draft: VisitorMessageDraft;
  status: VisitorMessageSendStatus;
  onDraftChange: (draft: VisitorMessageDraft) => void;
  onSubmit: () => void;
  onDismiss: () => void;
}

export interface HelpWindowCopy {
  paragraphs: readonly string[];
  messagePlaceholder: string;
}
