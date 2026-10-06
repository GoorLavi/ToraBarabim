import type { ReactNode } from 'react';

// What a visitor has typed so far into one form. Strings as typed:
// trimming and normalising happen when the message is built for the wire.
export interface VisitorMessageDraft {
  name: string;
  phone: string;
  message: string;
}

export type VisitorMessageSendStatus = 'idle' | 'sending' | 'sent' | 'failed';

// The window holds no state of its own and never branches on why it was
// opened: the caller supplies what the window says and owns the draft, the
// send status and what happens on submit.
export interface HelpWindowProps {
  className?: string;
  title: string;
  paragraphs: readonly string[];
  messagePlaceholder: string;
  // Shown between the paragraphs and the form: what the message is about.
  context?: ReactNode;
  draft: VisitorMessageDraft;
  status: VisitorMessageSendStatus;
  onDraftChange: (draft: VisitorMessageDraft) => void;
  onSubmit: () => void;
  onDismiss: () => void;
}
