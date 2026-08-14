import styled from 'styled-components';

import { CityGrid } from './components/CityGrid/CityGrid';
import { ContactCta } from './components/ContactCta/ContactCta';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { LessonsSection } from './components/LessonsSection/LessonsSection';
import { RabbiRow } from './components/RabbiRow/RabbiRow';
import { LESSON_WINDOW_DAYS, LESSON_WINDOW_PAGE_SIZE } from './consts';
import { addDays, resolveTargetDate } from './helpers';
import type { HomePageProps, LessonFilters } from './models';
import * as styles from './styles';
import { useDateFilter } from './useDateFilter';
import { useLessonSearch } from './useLessonSearch';
import { useSearchQuery } from './useSearchQuery';
import { useSelectedCity } from './useSelectedCity';

export const HomePage = styled(({ className }: HomePageProps) => {
  const { option, customDate, selectOption, selectCustomDate } = useDateFilter();
  const { city, select: selectCity } = useSelectedCity();
  const { query, setQuery } = useSearchQuery();

  const targetDate = resolveTargetDate(option, customDate);
  const filters: LessonFilters = {
    from: targetDate,
    to: addDays(targetDate, LESSON_WINDOW_DAYS),
    city: city?.id,
    pageSize: LESSON_WINDOW_PAGE_SIZE,
    q: query || undefined,
  };

  const lessonsQuery = useLessonSearch(filters);
  const isBrowseLoading = lessonsQuery.isPending;

  return (
    <div className={className}>
      <Header
        option={option}
        customDate={customDate}
        onSelectOption={selectOption}
        onSelectCustomDate={selectCustomDate}
        city={city}
        onSelectCity={selectCity}
        searchQuery={query}
        onSearchQueryChange={setQuery}
      />

      <main className="content">
        <LessonsSection query={lessonsQuery} targetDate={targetDate} city={city} searchQuery={query} />

        <RabbiRow items={lessonsQuery.data?.items} isLoading={isBrowseLoading} />

        <CityGrid items={lessonsQuery.data?.items} isLoading={isBrowseLoading} onSelectCity={selectCity} />

        <ContactCta />
      </main>

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
})`
  ${styles.HomePage}
`;
