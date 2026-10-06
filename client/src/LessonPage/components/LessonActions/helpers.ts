import { calendarEventOf, googleCalendarHref, lessonCalendarGoogleSubscribeHref, lessonCalendarWebcalUrl, lessonEventFilePath } from '~/lessonCalendar/helpers';

import type { CalendarChoice, CalendarLink, CalendarLinkRequest, CalendarPlatform } from './models';

// Read at click time, never at render: the server cannot know the phone, and
// a link that differed between server and client would not hydrate. Fails
// toward `other`: an unknown device is asked which calendar it uses, which is
// the safe question, since a file or `webcal://` link only suits a calendar
// app the person actually has.
export const calendarPlatformOf = (userAgent: string): CalendarPlatform => (/android/i.test(userAgent) ? 'android' : 'other');

// Android is never asked: its Google Calendar app does not import a downloaded
// `.ics` or a `webcal://` feed, so its calendar is Google whatever was passed.
export const effectiveCalendarOf = (calendar: CalendarChoice, platform: CalendarPlatform): CalendarChoice => (platform === 'android' ? 'google' : calendar);

// Google's links open in a tab of their own and may land in the browser rather
// than the app (accepted, 0055); the device's file and feed hand themselves to
// the calendar app.
export const calendarLinkOf = (request: CalendarLinkRequest): CalendarLink => {
  const calendar = effectiveCalendarOf(request.calendar, request.platform);
  if (request.scope === 'one') {
    return calendar === 'google'
      ? { href: googleCalendarHref(calendarEventOf(request.occurrence, 'static')), target: 'google' }
      : { href: lessonEventFilePath(request.occurrence), target: 'ics' };
  }
  return calendar === 'google'
    ? { href: lessonCalendarGoogleSubscribeHref(request.lessonId), target: 'google' }
    : { href: lessonCalendarWebcalUrl(request.lessonId), target: 'webcal' };
};

// A Google Calendar link opens in a tab of its own; the other two replace
// nothing, since the phone takes the file or the feed and leaves the page
// where it is.
export const opensInNewTab = (link: CalendarLink): boolean => link.target === 'google';
