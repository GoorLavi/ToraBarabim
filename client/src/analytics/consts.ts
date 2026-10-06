import type { ActiveFilters, PosterSource } from './models';

export const MIXPANEL_EVENTS = {
  pageView: 'Page View',
  search: 'Search',
  filterCity: 'Filter City',
  filterDate: 'Filter Date',
  lessonClick: 'Lesson Click',
  navigationClick: 'Navigation Click',
  resultsShown: 'Results Shown',
  rabbiClick: 'Rabbi Click',
  seeAllClick: 'See All Click',
  clearFiltersClick: 'Clear Filters Click',
  retryClick: 'Retry Click',
  railScroll: 'Rail Scroll',
  rabbiLogin: 'Rabbi Login',
  rabbiLogout: 'Rabbi Logout',
  panelTabClick: 'Panel Tab Click',
  lessonSaved: 'Lesson Saved',
  lessonDeleted: 'Lesson Deleted',
  occurrenceCancelled: 'Occurrence Cancelled',
  occurrenceRestored: 'Occurrence Restored',
  occurrenceMoved: 'Occurrence Moved',
  profileSaved: 'Profile Saved',
  profilePhotoUploaded: 'Profile Photo Uploaded',
  dedicationWindowOpen: 'Dedication Window Open',
  dedicationContactClick: 'Dedication Contact Click',
  courseClick: 'Course Click',
  courseContactClick: 'Course Contact Click',
  courseSaved: 'Course Saved',
  courseDuplicated: 'Course Duplicated',
  courseDeleted: 'Course Deleted',
  courseRegistrationClosed: 'Course Registration Closed',
  posterScan: 'Poster Scan',
  helpTileClick: 'Help Tile Click',
  visitorMessageSent: 'Visitor Message Sent',
  shareClick: 'Share Click',
  calendarAddClick: 'Calendar Add Click',
  calendarSheetOpen: 'Calendar Sheet Open',
  installCardShown: 'Install Card Shown',
  installCardDismissed: 'Install Card Dismissed',
  installAccepted: 'Install Accepted',
} as const;

// A `LessonCard` can sit in any of these lists; `homeRail` is the only one
// that also carries a `railTitle` (analytics/models.ts, LessonClickContext).
export type LessonSurface =
  | 'homeRail'
  | 'homeDayList'
  | 'searchResults'
  | 'lessonsGrid'
  | 'rabbiPage'
  | 'cityPage'
  | 'areaPage'
  | 'womensArea'
  | 'lessonPage'
  | 'placePage';

// A `CourseCard` can sit in any of these rails.
export type CourseSurface = 'homeRail' | 'rabbiPage' | 'placePage' | 'womensArea';

// The four screens that fire `Results Shown` (RabbisPage, CitiesPage and
// RabbiPage's lessons section do not, by design). Distinct from
// `LessonSurface`: this names a screen's result set, not a lesson card's
// position within one.
export type ResultsShownSurface = 'homeFiltered' | 'cityPage' | 'areaPage' | 'lessonsPage';

// Every route-level `ErrorBoundary` reload button except root.tsx's own
// last-resort one, which stays untracked; the twelve component- or
// query-level retries; and the two inside `CityPicker`. Named for where
// each one is, not for what failed, since several sites in the same page
// fail independently (a city's own detail call versus its lessons call).
export type RetrySurface =
  | 'homeRoute'
  | 'citiesRoute'
  | 'rabbisRoute'
  | 'placesRoute'
  | 'lessonRoute'
  | 'citiesPage'
  | 'lessonsPage'
  | 'lessonPage'
  | 'rabbiPageDetail'
  | 'rabbiPageLessons'
  | 'cityPageDetail'
  | 'cityPageLessons'
  | 'rabbisPage'
  | 'areaPageDetail'
  | 'areaPageLessons'
  | 'homeFiltered'
  | 'homeRails'
  | 'cityPickerSearch'
  | 'cityPickerSuggestions'
  | 'placePageDetail'
  | 'placePageLessons'
  | 'placesPage'
  | 'coursePage';

// Where a `ShareButton` sits: the three detail pages that carry one.
export type ShareSurface = 'lessonPage' | 'rabbiPage' | 'placePage';

export type FilterDateSource = 'chip' | 'calendar';
export type FilterCitySource = 'headerPicker' | 'homeCityGrid';
export type SeeAllTarget = 'rabbis' | 'cities' | 'lessons';
// The only surface a "see all" link exists on today; kept as its own union,
// like every other surface here, rather than a bare string literal, so a
// second surface is a one-line addition instead of a signature change.
export type SeeAllSurface = 'home';
export type RabbiClickSurface = 'homeRabbiRow' | 'rabbisPage' | 'cityPage' | 'lessonPage';
export type NavigationProvider = 'waze' | 'googleMaps';
export type AppSurface = 'public' | 'rabbiPanel' | 'placePanel' | 'adminPanel' | 'panelLogin';
export type Viewport = 'mobile' | 'desktop';

// How a visitor can add the site to their home screen, decided by what the
// browser can do first and by who it is second (InstallPrompt/helpers.ts).
// `chromiumPrompt` is the deferred native prompt; the iOS paths are
// share-menu instructions (Safari and every other iOS browser put the share
// button in different places); `androidGeneric` and `inAppBrowser` are
// instructions reachable from the footer only.
export type InstallPlatformPath = 'chromiumPrompt' | 'iosSafari' | 'iosOtherBrowser' | 'androidGeneric' | 'inAppBrowser';

// What opened the install flow: the automatic card, or the footer link.
export type InstallTrigger = 'auto' | 'footer';

// `pwaStartUrl` is a landing on the manifest's start_url (`?source=pwa`)
// that is not in a standalone window, such as an installed shortcut that
// opened in a browser tab. It is kept apart from `standalone` so the two
// are never counted as the same thing.
export type LaunchMode = 'standalone' | 'pwaStartUrl' | 'browser';

// Caps how long a page can hold events fired before the dynamic
// `mixpanel-browser` import resolves (or before an ad blocker, decision
// 0025, defeats it). Without a cap a session that never gets a working SDK
// grows this array for as long as the tab stays open.
export const MIXPANEL_QUEUE_CAP = 50;

export const EMPTY_ACTIVE_FILTERS: ActiveFilters = {
  cityId: undefined,
  cityName: undefined,
  dateOption: 'all',
  date: undefined,
  query: undefined,
};

// Automation that runs a real browser and so gets past Mixpanel's own
// crawler list, which matches named bots like Googlebot only: headless
// Chrome announces itself in the user agent, and a generic bot, crawl or
// spider word covers the rest. The Claude desktop app's browser pane, which
// agents drive, reports `webdriver` false and is caught only by the
// `Claude/<version>` token it adds to an otherwise ordinary Chrome agent.
export const AUTOMATED_USER_AGENT_PATTERN = /bot|crawl|spider|headless|\bClaude\//i;

export const INTERNAL_BROWSER_STORAGE_KEY = 'torabarabim:internalBrowser';

export const POSTER_SOURCE_PARAM = 'utm_source';

// Hand-mirrored from the QR codes printed on the two posters: the keys are
// the exact values a scan opens the site with, so changing one here without
// reprinting that poster silently drops its attribution. A `Map`, not an
// object literal: an object would answer `?utm_source=constructor` with a
// function from `Object.prototype`.
export const POSTER_SOURCES_BY_UTM_VALUE: ReadonlyMap<string, PosterSource> = new Map<string, PosterSource>([
  ['poster-listers', 'listers'],
  ['poster-seekers', 'seekers'],
]);
