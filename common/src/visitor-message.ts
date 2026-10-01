export type VisitorMessageType = 'rabbi-request' | 'volunteer';

export interface CreateVisitorMessageRequest {
  type: VisitorMessageType;
  name: string;
  // As typed by the visitor; the server normalises it to 05XXXXXXXX.
  phone: string;
  message: string;
}

export type VisitorMessageStatusFilter = 'all' | 'unhandled' | 'handled';

interface AdminVisitorMessageBase {
  id: string;
  type: VisitorMessageType;
  name: string;
  // Stored in local form ('0521234567'); the client renders 052-123-4567.
  phone: string;
  message: string;
  createdAt: string;
  // How the message was handled, written by the super admin. Never reaches
  // the public route or the Telegram alert.
  handlingNote: string | null;
}

export type AdminVisitorMessage =
  | (AdminVisitorMessageBase & { status: 'unhandled' })
  | (AdminVisitorMessageBase & { status: 'handled'; handledAt: string });

export interface VisitorMessageListResponse {
  items: AdminVisitorMessage[];
  page: number;
  pageSize: number;
  // Under the current status filter.
  total: number;
  // Every message under every filter: tells "none at all" from "none under
  // this filter" for the empty states.
  unfilteredTotal: number;
}

// At least one key: the union makes an empty body unrepresentable. The note
// is trimmed by the server, and '' clears it.
export type UpdateVisitorMessageRequest =
  | { handled: boolean; handlingNote?: string }
  | { handled?: boolean; handlingNote: string };
