import type { VisitorMessageStatusFilter, VisitorMessageType } from '@torabarabim/common';

export const HEADING = 'הודעות';

// Shown first, and what an absent `status` in the URL means: the screen is a
// queue of what still waits, not an archive.
export const DEFAULT_STATUS_FILTER: VisitorMessageStatusFilter = 'unhandled';
export const STATUS_PARAM = 'status';

export const FILTER_ORDER: readonly VisitorMessageStatusFilter[] = ['unhandled', 'handled', 'all'];
export const FILTER_LABELS: Record<VisitorMessageStatusFilter, string> = {
  unhandled: 'לא טופלו',
  handled: 'טופלו',
  all: 'כל ההודעות',
};

export const TYPE_LABELS: Record<VisitorMessageType, string> = {
  'rabbi-request': 'בקשה להוספת רב או רבנית',
  volunteer: 'התנדבות',
};

export const LOADING_MESSAGE = 'טוענים הודעות...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const NO_MESSAGES_HEADLINE = 'עוד אין הודעות.';
export const NO_UNHANDLED_MESSAGES_HEADLINE = 'אין הודעות שמחכות לטיפול.';
export const NO_HANDLED_MESSAGES_HEADLINE = 'עוד אין הודעות שטופלו.';

export const LOAD_MORE_LABEL = 'עוד הודעות';
export const LOAD_MORE_ERROR_MESSAGE = 'לא הצלחנו לטעון עוד הודעות. אפשר לנסות שוב.';
