import type { ActiveFilters } from './models';

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
} as const;

// The one channel the dedication window ever sends a reader to, WhatsApp or
// a phone call, whichever contact button they pressed.
export type DedicationContactChannel = 'whatsapp' | 'call';

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
  | 'placesPage';

export type FilterDateSource = 'chip' | 'calendar';
export type FilterCitySource = 'headerPicker' | 'homeCityGrid';
export type SeeAllTarget = 'rabbis' | 'cities' | 'lessons';
// The only surface a "see all" link exists on today; kept as its own union,
// like every other surface here, rather than a bare string literal, so a
// second surface is a one-line addition instead of a signature change.
export type SeeAllSurface = 'home';
export type RabbiClickSurface = 'homeRabbiRow' | 'rabbisPage' | 'cityPage' | 'lessonPage';
export type NavigationProvider = 'waze' | 'googleMaps';
export type AppSurface = 'public' | 'rabbiPanel' | 'adminPanel';
export type Viewport = 'mobile' | 'desktop';

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
