import styled from 'styled-components';

import { CityGrid } from './components/CityGrid/CityGrid';
import { ContactCta } from './components/ContactCta/ContactCta';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { HomeRails } from './components/HomeRails/HomeRails';
import { LessonsSection } from './components/LessonsSection/LessonsSection';
import { RabbiRow } from './components/RabbiRow/RabbiRow';
import { LESSON_WINDOW_DAYS, LESSON_WINDOW_PAGE_SIZE } from './consts';
import { addDays, contextLine, flattenHomeRows, resolveHomeMode, resolveTargetDate } from './helpers';
import type { HomePageProps, LessonFilters } from './models';
import * as styles from './styles';
import { useDateFilter } from './useDateFilter';
import { useHomeRows } from './useHomeRows';
import { useLessonSearch } from './useLessonSearch';
import { useSearchQuery } from './useSearchQuery';
import { useSelectedCity } from './useSelectedCity';

export const HomePage = styled(({ className }: HomePageProps) => {
  const { option, customDate, selectOption, selectCustomDate, clearDate } = useDateFilter();
  const { city, select: selectCity, clear: clearCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();

  const mode = resolveHomeMode(option, city, query);
  const hasDateFilter = option !== 'all';

  const targetDate = resolveTargetDate(option, customDate);
  const filters: LessonFilters = {
    from: targetDate,
    to: addDays(targetDate, LESSON_WINDOW_DAYS),
    city: city?.id,
    pageSize: LESSON_WINDOW_PAGE_SIZE,
    q: query || undefined,
  };

  const lessonsQuery = useLessonSearch(filters, mode === 'filtered');
  const homeRowsQuery = useHomeRows(mode === 'rail');

  const browseItems = mode === 'rail' ? flattenHomeRows(homeRowsQuery.data) : lessonsQuery.data?.items;
  const isBrowseLoading = mode === 'rail' ? homeRowsQuery.isPending : lessonsQuery.isPending;
  const isBrowseError = mode === 'rail' ? homeRowsQuery.isError : lessonsQuery.isError;
  const browseContextLine = contextLine(mode, query, lessonsQuery.data?.total);

  // The way back out of the dateless empty state (design-system.md, "Every
  // data screen has three states"): clears every filter and returns to the
  // unfiltered rows. Clearing the date too is harmless when it was never
  // set, and keeps this one function correct regardless of which filters
  // happen to be active when it is pressed.
  const clearFilters = (): void => {
    clearDate();
    clearCity();
    setQuery('');
  };

  return (
    <div className={className}>
      <Header
        option={option}
        customDate={customDate}
        onSelectOption={selectOption}
        onSelectCustomDate={selectCustomDate}
        onClearDate={clearDate}
        city={city}
        onSelectCity={selectCity}
        onClearCity={clearCity}
        searchQuery={query}
        onSearchQueryChange={setQuery}
      />

      <main className="content">
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

          <CityGrid items={browseItems} isLoading={isBrowseLoading} isError={isBrowseError} onSelectCity={selectCity} />

          <ContactCta />
        </div>
      </main>

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
})`
  ${styles.HomePage}
`;
