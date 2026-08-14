import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { HomePage } from '~/HomePage/HomePage';
import { GlobalStyle } from '~/styles/GlobalStyle';
import { THEMES } from '~/theme/themes';
import { useThemeSelection } from '~/theme/useThemeSelection';

import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

export const App = () => {
  const [themeName, setThemeName] = useThemeSelection();

  return (
    <ThemeProvider theme={THEMES[themeName]}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
        <ThemeSwitcher themeName={themeName} onSelect={setThemeName} />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
