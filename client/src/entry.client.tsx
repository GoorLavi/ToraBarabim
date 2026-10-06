import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import { startInstallPromptStore } from '~/pwa/installPromptStore';
import { registerServiceWorker } from '~/pwa/registerServiceWorker';

// Listening starts before hydration: the browser fires `beforeinstallprompt`
// once, possibly before React is done, and a late listener never hears it.
startInstallPromptStore();

// Framework mode hydrates the whole document (root.tsx owns <html>), not a
// `#root` div mounted by main.tsx, which this file replaces.
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});

registerServiceWorker();
