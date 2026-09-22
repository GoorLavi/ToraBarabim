import { useEffect, useState } from 'react';
import type { DedicationGroup } from '@torabarabim/common';
import styled from 'styled-components';

import { useAudienceFilter } from '~/hooks/useAudienceFilter';
import { useDateFilter } from '~/hooks/useDateFilter';
import { useSearchQuery } from '~/hooks/useSearchQuery';
import { useSelectedCity } from '~/hooks/useSelectedCity';

import { CityGrid } from './components/CityGrid/CityGrid';
import { ContactCta } from './components/ContactCta/ContactCta';
import { DedicationBand } from './components/DedicationBand/DedicationBand';
import { HomeRails } from './components/HomeRails/HomeRails';
import { LessonsSection } from './components/LessonsSection/LessonsSection';
import { RabbiRow } from './components/RabbiRow/RabbiRow';
import { HOME_QUERY_KEYS, LESSON_WINDOW_DAYS, LESSON_WINDOW_PAGE_SIZE } from './consts';
import { drawDedicationGroup } from './dedicationDraw';
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

  const homeRowsQuery = useHomeRows();
  const lessonsQuery = useLessonSearch(filters, mode === 'filtered');

  const [dedicationGroup, setDedicationGroup] = useState<DedicationGroup | undefined>(undefined);

  // Runs once per page load, in the one nearest common ancestor of both
  // placements, and passed down to each as a prop: two instances each
  // drawing their own would put two different type groups on one page
  // (design-system.md, dedication "The draw"). The empty dependency array
  // is deliberate, never guarded behind a ref or a module flag: `Math.random`
  // in the render path would make the server's pick and the client's first
  // paint disagree, a hydration mismatch, so the draw happens only here,
  // after mount. StrictMode's second invocation harmlessly overwrites.
  useEffect(() => {
    setDedicationGroup(drawDedicationGroup(homeRowsQuery.data?.dedications ?? [], Math.random));
  }, []);

  const browseItems = mode === 'rail' ? flattenHomeRows(homeRowsQuery.data) : lessonsQuery.data?.items;
  const isBrowseLoading = mode === 'rail' ? homeRowsQuery.isPending : lessonsQuery.isPending;
  const isBrowseError = mode === 'rail' ? homeRowsQuery.isError : lessonsQuery.isError;
  const browseContextLine = contextLine(mode);

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
            <HomeRails {...{ query: homeRowsQuery, dedicationGroup }} />
          ) : (
            <LessonsSection
              query={lessonsQuery}
              resultSetKey={HOME_QUERY_KEYS.lessons(filters)}
              hasDateFilter={hasDateFilter}
              targetDate={targetDate}
              city={city}
              searchQuery={query}
              onClearFilters={clearFilters}
            />
          )}
        </div>

        <RabbiRow {...{ rabbis: homeRowsQuery.data?.rabbis, isLoading: homeRowsQuery.isPending, isError: homeRowsQuery.isError }} />

        <CityGrid items={browseItems} isLoading={isBrowseLoading} isError={isBrowseError} onSelectCity={selectCity} />

        <ContactCta />
      </div>

      <DedicationBand {...{ group: dedicationGroup, variant: 'onPrimary' as const }} />
    </main>
  );
})`
  ${styles.HomePage}
`;
