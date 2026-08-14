import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '../src/styles/GlobalStyle';
import { DEFAULT_THEME_NAME, THEME_NAMES } from '../src/theme/consts';
import { THEMES } from '../src/theme/themes';

const queryClient = new QueryClient();

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'ערכת נושא',
      description: 'ratified color theme, design-system.md',
      defaultValue: DEFAULT_THEME_NAME,
      toolbar: {
        icon: 'paintbrush',
        items: THEME_NAMES,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => (
      // Storybook renders in its own preview document, separate from
      // index.html, so this is the one other place that sets dir/lang.
      <div dir="rtl" lang="he">
        <ThemeProvider theme={THEMES[context.globals.theme] ?? THEMES[DEFAULT_THEME_NAME]}>
          <GlobalStyle />
          <QueryClientProvider client={queryClient}>
            <Story />
          </QueryClientProvider>
        </ThemeProvider>
      </div>
    ),
  ],
};

export default preview;
