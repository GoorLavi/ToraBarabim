import type { Preview } from '@storybook/react-vite';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { GlobalStyle } from '../src/styles/GlobalStyle';
import { ARGAMAN_VE_ZAHAV_THEME } from '../src/theme/themes';
import { BREAKPOINTS } from '../src/theme/tokens';
import { installApiMocks } from './apiMocks';

// React Query pauses a retry while the tab is not visible or believes the
// network is down, neither of which applies to a story: its `fetch` never
// leaves the page, and a review often happens in a background tab. Without
// this, a retrying error-state story can sit in `loading` forever, with no
// failed request to explain it, the moment the tab is not the frontmost one.
// The event listener is replaced with a no-op first: `setFocused` alone
// already outlasts `visibilitychange` in this version (the listener notifies
// with the current state rather than overwriting it), but overriding the
// listener too means pinning it stays correct even if that internal changes.
focusManager.setEventListener(() => () => {});
focusManager.setFocused(true);

// A client per story, keyed by story id: a shared one lets a query cached by
// one story answer the next story's identical key without a request, so the
// next story's mocked state never renders. `retry: false`: the default retry
// (3, with backoff) makes an error-state story sit retrying before it shows
// its error, which reads as a hang rather than a designed error state. A
// page's own hook can still set its own `retry`, overriding this default,
// for a slug that is worth retrying once before showing an error.
// `networkMode: 'always'` pairs with pinning `focusManager` above: a story's
// `fetch` never touches the real network, so it must not pause for it either.
// `refetchOnWindowFocus: false`: pinning `focusManager` above means every
// `visibilitychange` back into the tab now reads as a focus event, which
// would otherwise refetch a story's stale data mid-review.
const StoryQueryClientProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, networkMode: 'always', refetchOnWindowFocus: false },
          mutations: { networkMode: 'always' },
        },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const preview: Preview = {
  beforeEach: ({ parameters }) => installApiMocks(parameters.apiMocks),
  parameters: {
    // The theme has no phone width: mobile is Storybook's own 375px preset,
    // the phone width design-system.md measures its cards at. Desktop is the
    // theme's widest breakpoint.
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: INITIAL_VIEWPORTS.iphonex.styles, type: 'mobile' },
        desktop: { name: 'Desktop', styles: { width: BREAKPOINTS.xl, height: '100%' }, type: 'desktop' },
      },
    },
  },
  initialGlobals: {
    viewport: { value: 'mobile', isRotated: false },
  },
  decorators: [
    (Story, { id }) => (
      // Storybook renders in its own preview document, separate from
      // index.html, so this is the one other place that sets dir/lang.
      // MemoryRouter: `LessonCard` is a real `<Link>` now (routes to a
      // lesson page), and `Link` throws outside a Router context.
      <div dir="rtl" lang="he">
        <ThemeProvider theme={ARGAMAN_VE_ZAHAV_THEME}>
          <GlobalStyle />
          <StoryQueryClientProvider key={id}>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </StoryQueryClientProvider>
        </ThemeProvider>
      </div>
    ),
  ],
};

export default preview;
