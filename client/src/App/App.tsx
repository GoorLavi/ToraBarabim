import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import { AdminPanel } from '~/AdminPanel/AdminPanel';
import { CitiesPage } from '~/CitiesPage/CitiesPage';
import { CityPage } from '~/CityPage/CityPage';
import { NotFoundScreen } from '~/components/NotFoundScreen/NotFoundScreen';
import * as notFoundConsts from '~/components/NotFoundScreen/consts';
import { LessonPageHeader } from '~/components/LessonPageHeader/LessonPageHeader';
import { ContactPage } from '~/ContactPage/ContactPage';
import { HomePage } from '~/HomePage/HomePage';
import { LessonPage } from '~/LessonPage/LessonPage';
import { LessonsPage } from '~/LessonsPage/LessonsPage';
import { RabbiPage } from '~/RabbiPage/RabbiPage';
import { RabbiPanel } from '~/RabbiPanel/RabbiPanel';
import { RabbisPage } from '~/RabbisPage/RabbisPage';
import { GlobalStyle } from '~/styles/GlobalStyle';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import * as styles from './styles';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

// The lesson page's own reduced header, minus its `BackLink`: there is
// nowhere to go back to from a route that never resolved to a page.
const RouteNotFoundPage = styled(({ className }: { className?: string }) => (
  <div className={className}>
    <LessonPageHeader />
    <div className="content">
      <NotFoundScreen
        heading={notFoundConsts.ROUTE_NOT_FOUND_HEADING}
        explanation={notFoundConsts.ROUTE_NOT_FOUND_EXPLANATION}
        actionLabel={notFoundConsts.BACK_TO_HOME_LABEL}
        actionTo="/"
      />
    </div>
  </div>
))`
  ${styles.RouteNotFoundPage}
`;

export const App = () => {
  return (
    <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lesson/:lessonId/:date" element={<LessonPage />} />
              <Route path="/lessons" element={<LessonsPage />} />
              <Route path="/rabbis" element={<RabbisPage />} />
              <Route path="/rabbis/:rabbiId" element={<RabbiPage />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/cities/:cityName" element={<CityPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/rabbi/*" element={<RabbiPanel />} />
              <Route path="*" element={<RouteNotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
