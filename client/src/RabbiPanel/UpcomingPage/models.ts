import type { LessonOccurrence } from '@torabarabim/common';

// The wire `LessonOccurrence` carries only the resolved time and place, so
// this attaches what the client derives by comparing it against the
// lesson's own base recurrence (see `helpers.ts`, `withDerivedFields`).
export interface UpcomingOccurrence extends LessonOccurrence {
  // The lesson's own recurring start time, present only when this
  // occurrence's time was moved away from it.
  movedFromTime: string | undefined;
  // True when this occurrence's place differs from the lesson's own base
  // place in any of name, street, or city: one flag covers any
  // combination of those, never one flag per field (design doc, section 3).
  placeChanged: boolean;
  // What the card shows when the lesson itself has no title: its own kind
  // (recurring/one-time), never the rabbi's name (design doc, section 4:
  // it is always the same rabbi here, so his name says nothing new).
  titleFallback: string;
}

export interface DayGroup {
  date: string;
  occurrences: UpcomingOccurrence[];
}

export type UpcomingState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'emptyFirst' }
  | { status: 'emptyWindow' }
  | { status: 'success'; groups: DayGroup[] };

export type ActiveSheet = { kind: 'cancel' | 'move'; occurrence: UpcomingOccurrence } | undefined;

export interface UpcomingPageProps {
  className?: string;
}
