import type { VisitorMessageDraft, VisitorMessageSendStatus } from '../../models';

export type VisitorMessageField = 'name' | 'phone' | 'message';

export type VisitorMessageFormErrors = Partial<Record<VisitorMessageField, string>>;

export interface VisitorMessageFormProps {
  className?: string;
  draft: VisitorMessageDraft;
  // `sent` is the window's own screen, so the form is never rendered in it.
  status: Exclude<VisitorMessageSendStatus, 'sent'>;
  // What the message field says before anything is typed: the one thing that
  // differs between the two tiles' forms, so the window passes it in.
  messagePlaceholder: string;
  onDraftChange: (draft: VisitorMessageDraft) => void;
  onSubmit: () => void;
}
