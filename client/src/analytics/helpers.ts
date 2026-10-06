import type { LessonOccurrence, Rabbi } from '@torabarabim/common';

import { AUTOMATED_USER_AGENT_PATTERN, POSTER_SOURCE_PARAM, POSTER_SOURCES_BY_UTM_VALUE } from './consts';
import type { AppSurface } from './consts';
import type { ActiveFilters, LessonClickContext, LessonClickProps, NavigationClickProps, PosterSource } from './models';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Both dates are day-only ISO strings, so the subtraction is exact days with
// no rounding surprises from a clock time. Never throws: a malformed date
// resolves to `NaN` rather than an exception, since no payload builder may
// take a navigation down with it.
export const daysAhead = (isoDate: string, todayIso: string): number =>
  Math.round((Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${todayIso}T00:00:00Z`)) / MS_PER_DAY);

// Walks the pathname's own segments rather than reading a pattern off the
// matched route: `Analytics.tsx` renders as a sibling of `<Outlet/>` in
// root.tsx, so `useParams()` there sees nothing, and hand-mirroring
// `routes.ts`'s path table would drift the moment a route changes there and
// not here. A segment becomes `:paramName` when it decodes to exactly one of
// the known param values.
export const routePattern = (pathname: string, params: Record<string, string | undefined>): string => {
  const paramEntries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return pathname
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      let decoded = segment;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        decoded = segment;
      }
      const paramMatch = paramEntries.find(([, value]) => value === decoded);
      return paramMatch ? `:${paramMatch[0]}` : segment;
    })
    .join('/');
};

const isUnderPath = (pathname: string, base: string): boolean => pathname === base || pathname.startsWith(`${base}/`);

// `/rabbi` and `/place` (the panels) share a prefix with `/rabbis` and
// `/places` (the public directories), so this checks the segment boundary
// rather than a plain `startsWith`, or every public rabbi and place page
// would misreport as a panel. `/login` is its own surface: one screen signs
// in rabbis, place accounts and admins alike, so it belongs to no single
// panel, and counting it as `public` would inflate seeker traffic.
export const appSurfaceFor = (pathname: string): AppSurface => {
  if (isUnderPath(pathname, '/admin')) return 'adminPanel';
  if (isUnderPath(pathname, '/rabbi')) return 'rabbiPanel';
  if (isUnderPath(pathname, '/place')) return 'placePanel';
  if (isUnderPath(pathname, '/login')) return 'panelLogin';
  return 'public';
};

export const lessonClickProps = (
  lesson: LessonOccurrence,
  teachingRabbi: Pick<Rabbi, 'id'>,
  rabbiName: string,
  context: LessonClickContext,
  filters: ActiveFilters,
  todayIso: string,
): LessonClickProps => ({
  lessonId: lesson.lessonId,
  date: lesson.date,
  startTime: lesson.startTime,
  ...context,
  status: lesson.status,
  isSubstitute: Boolean(lesson.substituteRabbi),
  rabbiId: teachingRabbi.id,
  rabbiName,
  cityName: lesson.venue.city,
  placeName: lesson.venue.name,
  audience: lesson.audience,
  ...(lesson.topic ? { topic: lesson.topic } : {}),
  daysAhead: daysAhead(lesson.date, todayIso),
  ...(filters.cityId ? { filterCityId: filters.cityId } : {}),
  ...(filters.cityName ? { filterCityName: filters.cityName } : {}),
  filterDateOption: filters.dateOption,
  ...(filters.date ? { filterDate: filters.date } : {}),
  ...(filters.query ? { filterQuery: filters.query } : {}),
});

export const navigationClickProps = (
  provider: NavigationClickProps['provider'],
  lesson: LessonOccurrence,
  teachingRabbi: Pick<Rabbi, 'id'>,
  rabbiName: string,
  todayIso: string,
): NavigationClickProps => ({
  provider,
  lessonId: lesson.lessonId,
  date: lesson.date,
  startTime: lesson.startTime,
  daysAhead: daysAhead(lesson.date, todayIso),
  cityName: lesson.venue.city,
  placeName: lesson.venue.name,
  rabbiId: teachingRabbi.id,
  rabbiName,
});

// `navigator.webdriver` is the flag Playwright, Puppeteer and Selenium set;
// the user agent catches automation that does not. Fails open: a browser
// that sets neither is counted as a person. The one known false positive,
// a Cubot phone whose model name contains "bot", costs that visitor's
// events and nothing the visitor can see.
export const isAutomatedBrowser = (browser: Pick<Navigator, 'userAgent' | 'webdriver'>): boolean =>
  browser.webdriver === true || AUTOMATED_USER_AGENT_PATTERN.test(browser.userAgent);

export const posterSourceFrom = (search: string): PosterSource | undefined => {
  const utmSource = new URLSearchParams(search).get(POSTER_SOURCE_PARAM);
  if (utmSource === null) return undefined;
  return POSTER_SOURCES_BY_UTM_VALUE.get(utmSource);
};
