import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { AdminPanel } from '~/AdminPanel/AdminPanel';
import { HomePage } from '~/HomePage/HomePage';
import { GlobalStyle } from '~/styles/GlobalStyle';
import type { ThemeName } from '~/theme/models';
import { THEMES } from '~/theme/themes';
import { useThemeSelection } from '~/theme/useThemeSelection';

import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

interface AppRoutesProps {
  themeName: ThemeName;
  onSelectTheme: (name: ThemeName) => void;
}

// `ThemeSwitcher` is a public-site dev affordance (see its own file) and
// must never cover the admin panel, so it is gated here on the route,
// which needs the router context `App` itself sits above.
const AppRoutes = ({ themeName, onSelectTheme }: AppRoutesProps) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </ErrorBoundary>
      {!isAdminRoute && <ThemeSwitcher themeName={themeName} onSelect={onSelectTheme} />}
    </>
  );
};

export const App = () => {
  const [themeName, setThemeName] = useThemeSelection();

  return (
    <ThemeProvider theme={THEMES[themeName]}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes themeName={themeName} onSelectTheme={setThemeName} />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
