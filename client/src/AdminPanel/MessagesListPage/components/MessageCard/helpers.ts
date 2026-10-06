import type { VisitorMessageSubject } from '@torabarabim/common';

import { joinWithMiddleDot, lessonPath, placeIdPath } from '~/helpers';

import { SUBJECT_LESSON_LINK_LABEL, SUBJECT_PLACE_LINK_LABEL } from './consts';

const israelDateFormatter = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jerusalem' });
const israelTimeFormatter = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Jerusalem' });

// "01.10.2026 · 14:32" in Israel time, whatever the reader's own zone is. Two
// formatters joined by the shared middle dot rather than one combined
// format: the combined one puts a comma between them, which a right to left
// line flips to the wrong side of the date.
export const formatReceivedAt = (isoTimestamp: string): string => {
  const moment = new Date(isoTimestamp);
  return joinWithMiddleDot([israelDateFormatter.format(moment), israelTimeFormatter.format(moment)]);
};

// Where a report points. A place goes by its id alone: the public route
// redirects it to the slugged address, and a report is stored with no slug.
export const reportSubjectLink = (subject: VisitorMessageSubject): { href: string; label: string } =>
  subject.kind === 'lesson'
    ? { href: lessonPath(subject), label: SUBJECT_LESSON_LINK_LABEL }
    : { href: placeIdPath({ id: subject.placeId }), label: SUBJECT_PLACE_LINK_LABEL };
