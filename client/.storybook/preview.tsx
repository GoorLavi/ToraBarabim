import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '../src/styles/GlobalStyle';
import { ARGAMAN_VE_ZAHAV_THEME } from '../src/theme/themes';

const queryClient = new QueryClient();

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
