export interface HandlingNoteProps {
  className?: string;
  messageId: string;
  // As stored: trimmed, and null when there is none (never an empty string).
  note: string | null;
}
