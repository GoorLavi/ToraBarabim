import { joinWithMiddleDot } from '~/helpers';

export const STATUS_UNHANDLED_LABEL = 'לא טופלה';
export const STATUS_HANDLED_LABEL = 'טופלה';
export const MARK_HANDLED_LABEL = 'סימון שטופלה';
export const UNDO_HANDLED_LABEL = 'ביטול הסימון';

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
