import styled from 'styled-components';

import { useAudienceFilter } from '~/hooks/useAudienceFilter';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import { CityGrid } from './components/CityGrid/CityGrid';
import { ContactCta } from './components/ContactCta/ContactCta';
import { HomeRails } from './components/HomeRails/HomeRails';
import { LessonsSection } from './components/LessonsSection/LessonsSection';
import { RabbiRow } from './components/RabbiRow/RabbiRow';
import { WomensAreaBand } from './components/WomensAreaBand/WomensAreaBand';
import { LESSON_WINDOW_DAYS, LESSON_WINDOW_PAGE_SIZE } from './consts';
import { addDays, contextLine, flattenHomeRows, resolveHomeMode, resolveTargetDate } from './helpers';
import type { HomePageProps, LessonFilters } from './models';
import * as styles from './styles';
import { useHomeRows } from './useHomeRows';
import { useLessonSearch } from './useLessonSearch';

export const HomePage = styled(({ className }: HomePageProps) => {
  const { option, customDate, selectOption, selectCustomDate, clearDate } = useDateFilter();
  const { city, select: selectCity, clear: clearCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();
  const { filter: audienceFilter, selectFilter: selectAudienceFilter, clearFilter: clearAudienceFilter } = useAudienceFilter();

  const mode = resolveHomeMode(option, city, query, audienceFilter);
  const hasDateFilter = option !== 'all';

  const targetDate = resolveTargetDate(option, customDate);
  const filters: LessonFilters = {
    from: targetDate,
    to: addDays(targetDate, LESSON_WINDOW_DAYS),
    city: city?.id,
    pageSize: LESSON_WINDOW_PAGE_SIZE,
    q: query || undefined,
    audience: audienceFilter,
  };

  const lessonsQuery = useLessonSearch(filters, mode === 'filtered');
  // Always enabled, in both modes: the band's count reads `GET /v1/home`'s
  // own `womensAreaLessonCount` rather than a second fetch to `GET
  // /v1/women` for the same number (plan fix round, decision: "the band and
  // tile read womensAreaLessonCount from the home response"). SSR already
  // seeds this query's cache on first paint regardless of which mode the
  // URL lands in, so this costs a real request only when nothing was seeded.
  const homeRowsQuery = useHomeRows(true);

  const browseItems = mode === 'rail' ? flattenHomeRows(homeRowsQuery.data) : lessonsQuery.data?.items;
  const isBrowseLoading = mode === 'rail' ? homeRowsQuery.isPending : lessonsQuery.isPending;
  const isBrowseError = mode === 'rail' ? homeRowsQuery.isError : lessonsQuery.isError;
  const browseContextLine = contextLine(mode);
  const womensAreaLessonCount = homeRowsQuery.data?.womensAreaLessonCount ?? 0;

  // The way back out of the dateless empty state (design-system.md, "Every
  // data screen has three states"): clears every filter and returns to the
  // unfiltered rows. Clearing the date too is harmless when it was never
  // set, and keeps this one function correct regardless of which filters
  // happen to be active when it is pressed.
  const clearFilters = (): void => {
    clearDate();
    clearCity();
    setQuery('');
    clearAudienceFilter();
  };

  return (
    <main className={className}>
      <div className="band">
        <div className="browse">
          {browseContextLine && (
            <p className="context" dir="auto">
              {browseContextLine}
            </p>
          )}

          {mode === 'rail' ? (
            <HomeRails query={homeRowsQuery} />
          ) : (
            <LessonsSection
              query={lessonsQuery}
              hasDateFilter={hasDateFilter}
              targetDate={targetDate}
              city={city}
              searchQuery={query}
              onClearFilters={clearFilters}
            />
          )}
        </div>

        <RabbiRow items={browseItems} isLoading={isBrowseLoading} isError={isBrowseError} />

        {womensAreaLessonCount > 0 && <WomensAreaBand {...{ lessonCount: womensAreaLessonCount }} />}

        <CityGrid items={browseItems} isLoading={isBrowseLoading} isError={isBrowseError} onSelectCity={selectCity} />

        <ContactCta />
      </div>
    </main>
  );
})`
  ${styles.HomePage}
`;
