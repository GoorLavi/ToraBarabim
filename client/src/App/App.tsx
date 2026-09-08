import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { AdminPanel } from '~/AdminPanel/AdminPanel';
import { CitiesPage } from '~/CitiesPage/CitiesPage';
import { CityPage } from '~/CityPage/CityPage';
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
import { Layout } from './components/Layout/Layout';
import { RouteNotFoundPage } from './components/RouteNotFoundPage/RouteNotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

export const App = () => {
  return (
    <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/lesson/:lessonId/:date" element={<LessonPage />} />
                <Route path="/lessons" element={<LessonsPage />} />
                <Route path="/rabbis" element={<RabbisPage />} />
                <Route path="/rabbis/:rabbiId" element={<RabbiPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/cities/:cityName" element={<CityPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<RouteNotFoundPage />} />
              </Route>
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/rabbi/*" element={<RabbiPanel />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
