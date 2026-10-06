import type { VisitorMessageSubject } from '@torabarabim/common';

import { ADMIN_MESSAGES_PATH, lessonSubjectPath, placeSubjectPath, SITE_ORIGIN, SUBJECT_ALERT_LABELS_HE, VISITOR_MESSAGE_TYPE_LABELS_HE } from './consts';
import type { VisitorMessageRecord } from './models';
import { subjectOfReport } from './subject';

// '0521234567' to '052-123-4567'. Only ever sees a phone the schema and the
// table CHECK already hold to ten digits.
export const formatLocalPhone = (phone: string): string => `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;

const subjectAlertLine = (subject: VisitorMessageSubject): string => {
  const path = subject.kind === 'lesson' ? lessonSubjectPath(subject.lessonId, subject.date) : placeSubjectPath(subject.placeId);
  return `${SUBJECT_ALERT_LABELS_HE[subject.kind]}: ${SITE_ORIGIN}${path}`;
};

// Plain text on purpose: no markup is ever interpreted, so a visitor cannot
// shape the alert. Stays far under Telegram's 4096-character limit, since
// the name and the message are capped at 80 and 1000 and a subject's ids at 100.
export const formatVisitorMessageAlert = (
  record: Pick<VisitorMessageRecord, 'id' | 'type' | 'name' | 'phone' | 'message' | 'subjectKind' | 'subjectId' | 'subjectDate'>,
): string =>
  [
    'הודעה חדשה באתר',
    `סוג: ${VISITOR_MESSAGE_TYPE_LABELS_HE[record.type]}`,
    `שם: ${record.name}`,
    `טלפון: ${formatLocalPhone(record.phone)}`,
    ...(record.type === 'report-mistake' ? [subjectAlertLine(subjectOfReport(record))] : []),
    'הודעה:',
    record.message,
    'לפתיחה בפאנל:',
    `${SITE_ORIGIN}${ADMIN_MESSAGES_PATH}`,
  ].join('\n');
