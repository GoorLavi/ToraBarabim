import * as consts from './consts';
import type { GoogleCalendarMarkProps } from './models';

// Sized by whoever places it. Decorative: the row or line beside it names
// "יומן Google", so it is hidden from a screen reader.
export const GoogleCalendarMark = ({ className }: GoogleCalendarMarkProps) => (
  <svg className={className} viewBox={consts.GOOGLE_CALENDAR_MARK_VIEW_BOX} aria-hidden="true">
    {consts.GOOGLE_CALENDAR_MARK_PATHS.map(({ d, fill }) => (
      <path key={d} d={d} fill={fill} />
    ))}
    <path d={consts.GOOGLE_CALENDAR_MARK_DIGITS_PATH} fill="none" stroke={consts.GOOGLE_CALENDAR_MARK_DIGITS_COLOR} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
