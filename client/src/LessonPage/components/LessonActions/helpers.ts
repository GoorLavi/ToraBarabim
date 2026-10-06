import type { LessonOccurrence } from '@torabarabim/common';

import { calendarEventOf, googleCalendarHref, lessonCalendarGoogleSubscribeHref, lessonCalendarWebcalUrl, lessonEventFilePath } from '~/lessonCalendar/helpers';

import type { CalendarLink, CalendarPlatform } from './models';


// Read at click time, never at render: the server cannot know the phone, and
// a link that differed between server and client would not hydrate. Fails
// toward `other`: an unknown device gets the file and `webcal://` choices,
// which every desktop and iPhone handles.
export const calendarPlatformOf = (userAgent: string): CalendarPlatform => (/android/i.test(userAgent) ? 'android' : 'other');

// The Google Calendar app on Android does not import a downloaded `.ics`, so
// there the one-off add is a prefilled Google event instead.
export const addOneEventLink = (occurrence: LessonOccurrence, platform: CalendarPlatform): CalendarLink =>
  platform === 'android'
    ? { href: googleCalendarHref(calendarEventOf(occurrence, 'static')), target: 'google' }
    : { href: lessonEventFilePath(occurrence), target: 'ics' };

// Android cannot subscribe to a `webcal://` feed from a download, so it goes
// through Google's own subscribe link, which may land in the browser rather
// than the app (accepted).
export const subscribeToLessonLink = (lessonId: string, platform: CalendarPlatform): CalendarLink =>
  platform === 'android'
    ? { href: lessonCalendarGoogleSubscribeHref(lessonId), target: 'google' }
    : { href: lessonCalendarWebcalUrl(lessonId), target: 'webcal' };

// A Google Calendar link opens in a tab of its own, which Android hands to the
// Google Calendar app or the browser; the other two replace nothing, since the
// phone takes the file or the feed and leaves the page where it is.
export const opensInNewTab = (link: CalendarLink): boolean => link.target === 'google';
