import type { DedicationType, LessonAudience, LessonOccurrence } from '@torabarabim/common';
import type { ReactNode } from 'react';

import type { DateFilterOption } from '~/hooks/models';

import { MIXPANEL_EVENTS } from './consts';
import type {
  AppSurface,
  FilterCitySource,
  FilterDateSource,
  LessonSurface,
  NavigationProvider,
  RabbiClickSurface,
  ResultsShownSurface,
  RetrySurface,
  SeeAllSurface,
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

export interface SuperProperties {
  viewport: Viewport;
  appSurface: AppSurface;
}

export type AnalyticsEventName = (typeof MIXPANEL_EVENTS)[keyof typeof MIXPANEL_EVENTS];

// The rabbi and admin panels fire events of their own (login/logout, tab
// clicks, saves, deletes, occurrence actions) that this change does not
// touch: each keeps the loose shape `trackEvent` always accepted, so a panel
// call site that passes no props at all (`trackEvent(MIXPANEL_EVENTS.rabbiLogout)`)
// still compiles unchanged. Typing these is future work for whoever next
// touches RabbiPanel or AdminPanel analytics.
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
  [MIXPANEL_EVENTS.rabbiLogin]: UntypedPanelEventProps;
  [MIXPANEL_EVENTS.rabbiLogout]: UntypedPanelEventProps;
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
};
