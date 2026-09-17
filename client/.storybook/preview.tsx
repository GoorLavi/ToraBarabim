import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '../src/styles/GlobalStyle';
import { ARGAMAN_VE_ZAHAV_THEME } from '../src/theme/themes';

// `retry: false`: TanStack Query's default retry (3, with backoff) means an
// error-state story sits there retrying before it shows its error, reading
// as a hang rather than a designed error state. One client shared by every
// story, not a fresh one per story: every mocked story already answers a
// distinct URL (a story-specific id or slug) rather than a shared query key,
// so nothing here risks one story showing another's cached data.
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const preview: Preview = {
  decorators: [
    (Story) => (
      // Storybook renders in its own preview document, separate from
      // index.html, so this is the one other place that sets dir/lang.
      // MemoryRouter: `LessonCard` is a real `<Link>` now (routes to a
      // lesson page), and `Link` throws outside a Router context.
      <div dir="rtl" lang="he">
        <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
          <GlobalStyle />
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </QueryClientProvider>
        </ThemeProvider>
      </div>
    ),
  ],
};

export default preview;
