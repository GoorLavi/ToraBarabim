// The two requests the home tiles offer. A report is not one of them: it
// opens from a lesson or a place page, never from a tile.
export type HelpRequestType = 'rabbi-request' | 'volunteer';

export type VisitorMessageType = HelpRequestType | 'report-mistake';

// What a report is about. A lesson is named by id and date, since a report
// concerns one occurrence; a place by id. Not a foreign key anywhere: a
// lesson is hard-deleted and the report must outlive it.
export type VisitorMessageSubject = { kind: 'lesson'; lessonId: string; date: string } | { kind: 'place'; placeId: string };

interface VisitorMessageFields {
  name: string;
  // As typed by the visitor; the server normalises it to 05XXXXXXXX.
  phone: string;
  message: string;
}

// Only a report carries a subject; a help request with one is rejected.
export type CreateVisitorMessageRequest =
  | (VisitorMessageFields & { type: HelpRequestType })
  | (VisitorMessageFields & { type: 'report-mistake'; subject: VisitorMessageSubject });

export type VisitorMessageStatusFilter = 'all' | 'unhandled' | 'handled';

interface AdminVisitorMessageBase {
  id: string;
  name: string;
  // Stored in local form ('0521234567'); the client renders 052-123-4567.
  phone: string;
  message: string;
  createdAt: string;
  // How the message was handled, written by the super admin. Never reaches
  // the public route or the Telegram alert.
  handlingNote: string | null;
}

type AdminVisitorMessageContent =
  | (AdminVisitorMessageBase & { type: HelpRequestType })
  | (AdminVisitorMessageBase & { type: 'report-mistake'; subject: VisitorMessageSubject });

type AdminVisitorMessageHandling = { status: 'unhandled' } | { status: 'handled'; handledAt: string };

export type AdminVisitorMessage = AdminVisitorMessageContent & AdminVisitorMessageHandling;

export interface VisitorMessageListResponse {
  items: AdminVisitorMessage[];
  pageSize: number;
  // Opaque: pass it back as `before` to read the next, older page. Null when
  // there is no older message under the current filter. Keyset rather than
  // offset paging, so a message arriving or a card being marked handled
  // between two pages never duplicates or skips a card.
  nextCursor: string | null;
  // Every message under every filter: tells "none at all" from "none under
  // this filter" for the empty states.
  unfilteredTotal: number;
}

// At least one key: the union makes an empty body unrepresentable. The note
// is trimmed by the server, and '' clears it.
export type UpdateVisitorMessageRequest =
  | { handled: boolean; handlingNote?: string }
  | { handled?: boolean; handlingNote: string };
