import type { MetaFunction } from 'react-router';

export { PanelLogin as default } from '~/PanelLogin/PanelLogin';

// A login screen, never a public search result (decision 0023), mirroring
// admin.tsx and rabbi-panel.tsx.
export const meta: MetaFunction = () => [{ name: 'robots', content: 'noindex, nofollow' }];
