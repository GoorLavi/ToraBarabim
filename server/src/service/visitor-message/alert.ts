import { ADMIN_MESSAGES_PATH, SITE_ORIGIN, VISITOR_MESSAGE_TYPE_LABELS_HE } from './consts';
import type { VisitorMessageRecord } from './models';

// '0521234567' to '052-123-4567'. Only ever sees a phone the schema and the
// table CHECK already hold to ten digits.
export const formatLocalPhone = (phone: string): string => `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;

// Plain text on purpose: no markup is ever interpreted, so a visitor cannot
// shape the alert. Stays far under Telegram's 4096-character limit, since
// the name and the message are capped at 80 and 1000.
export const formatVisitorMessageAlert = (record: Pick<VisitorMessageRecord, 'type' | 'name' | 'phone' | 'message'>): string =>
  [
    'הודעה חדשה באתר',
    `סוג: ${VISITOR_MESSAGE_TYPE_LABELS_HE[record.type]}`,
    `שם: ${record.name}`,
    `טלפון: ${formatLocalPhone(record.phone)}`,
    'הודעה:',
    record.message,
    'לפתיחה בפאנל:',
    `${SITE_ORIGIN}${ADMIN_MESSAGES_PATH}`,
  ].join('\n');
