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

// Storybook renders in its own preview document, whose `<html>` the app does
// not render, so the attributes `root.tsx` puts there have to be reproduced
// here. On the document element rather than on a wrapper, because a portal
// (`ResponsiveSheet`) appends to `document.body` and therefore inherits from
// the document root and nothing else: a wrapper would leave every sheet
// rendering as an unmarked, left-to-right English subtree, which is what a
// native `type='time'` control reads to decide how to display itself. The app
// does not need this, so it does not do it: this is the harness catching up
// with the app, not a second place that decides direction.
if (typeof document !== 'undefined') {
  document.documentElement.lang = 'he';
  document.documentElement.dir = 'rtl';
}

const preview: Preview = {
  decorators: [
    // MemoryRouter: `LessonCard` is a real `<Link>` now (routes to a lesson
    // page), and `Link` throws outside a Router context.
    (Story) => (
      <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
