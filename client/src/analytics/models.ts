import type { CloseReason, DedicationType, HomeLessonRowId, LessonAudience, LessonOccurrence, VisitorMessageType } from '@torabarabim/common';
import type { ReactNode } from 'react';

import type { DateFilterOption } from '~/hooks/models';

import { MIXPANEL_EVENTS } from './consts';
import type {
  AppSurface,
  CAMPAIGN_SOURCES,
  CourseSurface,
  FilterCitySource,
  FilterDateSource,
  InstallPlatformPath,
  InstallTrigger,
  LaunchMode,
  LessonSurface,
  NavigationProvider,
  RabbiClickSurface,
  ResultsShownSurface,
  RetrySurface,
  SeeAllSurface,
  ShareSurface,
  SeeAllTarget,
  Viewport,
} from './consts';

// The header's three filters, read from one place (`ActiveFiltersProvider`,
// fed by `Layout.tsx`) rather than re-read from the URL at every call site.
// `dateOption` is always present, `'all'` meaning no date filter is active;
// `date` only carries a value when `dateOption` is `'custom'`.
export interface ActiveFilters {
  cityId: string | undefined;
  cityName: string | undefined;
  dateOption: DateFilterOption;
  date: string | undefined;
  query: string | undefined;
}

export interface ActiveFiltersProviderProps {
  children: ReactNode;
  filters: ActiveFilters;
}

// `position` is zero-based and scoped to the list the card sits in: within
// a rail, within one day group (so it restarts per day on the city and area
// pages), within the visible slice on the home day list, and across every
// loaded page on `/lessons`. A dashboard reading "position 0" on its own
// cannot tell which list that was, hence `surface` always travels with it.
// `railTitle` exists only where `surface` is `'homeRail'`, so the two
// components that build this (`LessonsGrid`, `LessonRail`) can never end up
// passing a title without a rail, or a rail without one.
export type LessonClickContext =
  | { surface: 'homeRail'; railTitle: string; position: number }
  | { surface: Exclude<LessonSurface, 'homeRail'>; position: number };

interface LessonClickFields {
  lessonId: string;
  date: string;
  startTime: string;
  status: LessonOccurrence['status'];
  isSubstitute: boolean;
  rabbiId: string;
  rabbiName: string;
  cityName: string;
  placeName: string;
  audience: LessonAudience;
  topic?: LessonOccurrence['topic'];
  daysAhead: number;
  filterCityId?: string;
  filterCityName?: string;
  filterDateOption: DateFilterOption;
  // The chosen day, present only when `filterDateOption` is `'custom'`,
  // which on its own says a day was picked but not which one.
  filterDate?: string;
  filterQuery?: string;
}

export type LessonClickProps = LessonClickContext & LessonClickFields;

export interface NavigationClickProps {
  provider: NavigationProvider;
  lessonId: string;
  date: string;
  startTime: string;
  daysAhead: number;
  cityName: string;
  placeName: string;
  rabbiId: string;
  rabbiName: string;
}

export interface ResultsShownProps {
  surface: ResultsShownSurface;
  // The whole fetched window, not the count actually rendered: `DayLessons`
  // slices its `items` down for display, and this is the size of the set
  // behind that slice, not what is on screen when the event fires.
  resultCount: number;
  hasResults: boolean;
  query?: string;
  cityId?: string;
  cityName?: string;
  // Only carries a value on `AreaPage`, where the active "city" dimension is
  // actually a region. Kept apart from `cityName` so the two can never be
  // confused for the same thing on a downstream dashboard.
  areaName?: string;
  dateOption?: DateFilterOption;
  date?: string;
}

export interface RabbiClickProps {
  rabbiId: string;
  rabbiName: string;
  surface: RabbiClickSurface;
  position: number;
}

export interface SeeAllClickProps {
  target: SeeAllTarget;
  surface: SeeAllSurface;
}

export interface ClearFiltersClickProps {
  cityId?: string;
  dateOption: DateFilterOption;
  query?: string;
}

export interface RetryClickProps {
  surface: RetrySurface;
}

export interface RailScrollProps {
  railTitle: string;
  direction: 'prev' | 'next';
}

export interface PageViewProps {
  path: string;
  routePattern: string;
}

export interface SearchProps {
  query: string;
  queryLength: number;
  cityId?: string;
  cityName?: string;
  dateOption: DateFilterOption;
  date?: string;
}

export interface FilterCityProps {
  cityId: string;
  cityName: string;
  source: FilterCitySource;
}

export interface FilterDateProps {
  option: Exclude<DateFilterOption, 'all'>;
  date?: string;
  source: FilterDateSource;
}

export interface DedicationWindowOpenProps {
  bandType: DedicationType;
}

export type DedicationContactChannel = 'whatsapp' | 'call';

export interface DedicationContactClickProps {
  channel: DedicationContactChannel;
  bandType: DedicationType;
}

// Simpler than `LessonClickContext`: no surface carries a rail title of its
// own, since `Course Click` (unlike `Lesson Click`) never needs to name
// which rail a click came from.
export interface CourseClickContext {
  surface: CourseSurface;
  position: number;
}

export type CourseClickProps = CourseClickContext & {
  courseId: string;
  courseName: string;
};

export type CourseContactChannel = 'whatsapp' | 'call';

export interface CourseContactClickProps {
  channel: CourseContactChannel;
  courseId: string;
  courseName: string;
}

// The rabbi and admin panels' own course lifecycle events, typed like
// `DedicationWindowOpenProps`/`DedicationContactClickProps` above rather
// than the loose `UntypedPanelEventProps` every other panel event still
// uses (typing the rest is future work for whoever next touches that).
export interface CourseSavedProps {
  courseId: string;
  isNew: boolean;
}

export interface CourseDuplicatedProps {
  sourceCourseId: string;
  courseId: string;
}

export interface CourseDeletedProps {
  courseId: string;
}

export interface CourseRegistrationClosedProps {
  courseId: string;
  reason: CloseReason;
}

// Which of the two print posters a visitor's QR scan came from: `listers` is
// the recruiting poster, `seekers` the one for people looking for a lesson.
export type PosterSource = 'listers' | 'seekers';

export interface PosterScanProps {
  posterSource: PosterSource;
}

// The `utm_source` of a campaign link a visitor landed on. Unlike a poster
// scan it has no event of its own: it only rides on the events that follow.
export type CampaignSource = (typeof CAMPAIGN_SOURCES)[number];

// Named for what a visitor pressed, not for the wire's `HelpTileKind`: the
// request tile's wire value is a hyphenated word, the event's is a plain
// label, and this stays readable on a dashboard.
export type HelpTileEventKind = 'rabbiRequest' | 'volunteer' | 'share';

// Carries which tile in which row and where in it, never what a visitor
// typed: the form's name, phone and message never leave the page.
export interface HelpTileClickProps {
  tile: HelpTileEventKind;
  rowId: HomeLessonRowId;
  position: number;
}

export interface VisitorMessageSentProps {
  type: VisitorMessageType;
}

// `native` is the system share sheet, `copy` the link copied instead. The
// person closing the native sheet fires nothing: it is not a share.
export interface ShareClickProps {
  surface: ShareSurface;
  method: 'native' | 'copy';
}

// `static` adds one date, `subscribe` follows the lesson's feed. `target` is
// what the click opened: an `.ics` file, a Google Calendar link or the
// `webcal://` feed. `calendar` is the calendar the person said they use.
export interface CalendarAddClickProps {
  kind: 'static' | 'subscribe';
  calendar: 'google' | 'device';
  target: 'ics' | 'google' | 'webcal';
}

// The calendar sheet opening, so a sheet opened and abandoned is visible
// against the clicks that follow it.
export interface CalendarSheetOpenProps {
  kind: 'once' | 'weekly';
}
export interface InstallEventContext {
  platformPath: InstallPlatformPath;
  trigger: InstallTrigger;
}

export type InstallCardShownProps = InstallEventContext;

// `nativePrompt` is the browser's own dialog, dismissed after the person
// accepted our card; `card` is our own card or footer sheet. Reported as one
// event with a step rather than a fourth event name.
export type InstallCardDismissedProps = InstallEventContext & {
  step: 'card' | 'nativePrompt';
};

export type InstallAcceptedProps = InstallEventContext;

export interface SuperProperties {
  viewport: Viewport;
  appSurface: AppSurface;
  launchMode: LaunchMode;
  posterSource?: PosterSource;
  campaignSource?: CampaignSource;
}

// Who a signed-in panel account is, as Mixpanel is told. `name` is the
// display form, never the account's bare copy: a rabbi's carries the
// honorific.
export type PanelUserIdentity =
  | { role: 'rabbi'; accountId: string; name: string; rabbiId: string }
  | { role: 'place'; accountId: string; name: string; placeId: string };

export type AnalyticsEventName = (typeof MIXPANEL_EVENTS)[keyof typeof MIXPANEL_EVENTS];

// The rabbi and admin panels fire events of their own (`Rabbi Logout`, tab
// clicks, saves, deletes, occurrence actions) that keep the loose shape
// `trackEvent` always accepted, so a panel call site that passes no props at
// all (`trackEvent(MIXPANEL_EVENTS.rabbiLogout)`) still compiles unchanged.
// Typing these is future work for whoever next touches RabbiPanel or
// AdminPanel analytics; `Panel Login` and `Place Logout` are already typed.
type UntypedPanelEventProps = Record<string, unknown> | undefined;

export type AnalyticsEventProps = {
  [MIXPANEL_EVENTS.pageView]: PageViewProps;
  [MIXPANEL_EVENTS.search]: SearchProps;
  [MIXPANEL_EVENTS.filterCity]: FilterCityProps;
  [MIXPANEL_EVENTS.filterDate]: FilterDateProps;
  [MIXPANEL_EVENTS.lessonClick]: LessonClickProps;
  [MIXPANEL_EVENTS.navigationClick]: NavigationClickProps;
  [MIXPANEL_EVENTS.resultsShown]: ResultsShownProps;
  [MIXPANEL_EVENTS.rabbiClick]: RabbiClickProps;
  [MIXPANEL_EVENTS.seeAllClick]: SeeAllClickProps;
  [MIXPANEL_EVENTS.clearFiltersClick]: ClearFiltersClickProps;
  [MIXPANEL_EVENTS.retryClick]: RetryClickProps;
  [MIXPANEL_EVENTS.railScroll]: RailScrollProps;
  [MIXPANEL_EVENTS.panelLogin]: undefined;
  [MIXPANEL_EVENTS.rabbiLogout]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.placeLogout]: undefined;
  [MIXPANEL_EVENTS.panelTabClick]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.lessonSaved]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.lessonDeleted]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.occurrenceCancelled]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.occurrenceRestored]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.occurrenceMoved]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.profileSaved]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.profilePhotoUploaded]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.dedicationWindowOpen]: DedicationWindowOpenProps;
  [MIXPANEL_EVENTS.dedicationContactClick]: DedicationContactClickProps;
  [MIXPANEL_EVENTS.courseClick]: CourseClickProps;
  [MIXPANEL_EVENTS.courseContactClick]: CourseContactClickProps;
  [MIXPANEL_EVENTS.courseSaved]: CourseSavedProps;
  [MIXPANEL_EVENTS.courseDuplicated]: CourseDuplicatedProps;
  [MIXPANEL_EVENTS.courseDeleted]: CourseDeletedProps;
  [MIXPANEL_EVENTS.courseRegistrationClosed]: CourseRegistrationClosedProps;
  [MIXPANEL_EVENTS.posterScan]: PosterScanProps;
  [MIXPANEL_EVENTS.helpTileClick]: HelpTileClickProps;
  [MIXPANEL_EVENTS.visitorMessageSent]: VisitorMessageSentProps;
  [MIXPANEL_EVENTS.shareClick]: ShareClickProps;
  [MIXPANEL_EVENTS.calendarAddClick]: CalendarAddClickProps;
  [MIXPANEL_EVENTS.calendarSheetOpen]: CalendarSheetOpenProps;
  [MIXPANEL_EVENTS.installCardShown]: InstallCardShownProps;
  [MIXPANEL_EVENTS.installCardDismissed]: InstallCardDismissedProps;
  [MIXPANEL_EVENTS.installAccepted]: InstallAcceptedProps;
};
