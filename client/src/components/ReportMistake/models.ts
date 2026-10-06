import type { VisitorMessageSubject } from '@torabarabim/common';

export interface ReportMistakeProps {
  className?: string;
  subject: VisitorMessageSubject;
  // What the report is about, one fact to a line, as the page already shows
  // it (the lesson's title and rabbi, its date and time, its venue). The
  // person sees it above the form so they know which listing they are
  // writing about.
  contextLines: readonly string[];
}
