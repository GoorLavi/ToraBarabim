import type { StorybookConfig } from '@storybook/react-vite';

// The plugins vite.config.ts adds for the app build that Storybook must not
// load. `reactRouter()` returns sixteen plugins, not one, and one of them
// throws "The React Router Vite plugin requires the use of a Vite config
// file" the moment Storybook's builder resolves the config. That took
// Storybook down completely from the SSR migration (0023) until someone next
// tried to open it, which was not until the area page needed stories.
const APP_ONLY_PLUGIN_PREFIXES = ['react-router', 'prerender'];

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-vitest'],

  // Storybook renders components in isolation and needs none of the routing
  // build. Dropping those plugins here keeps one Vite config for the app
  // instead of forking a second one for Storybook, and everything the
  // stories do need, the `~` alias among it, comes from the rest of that
  // config unchanged.
  //
  // The flatten is load bearing: Vite accepts nested plugin arrays, so
  // `plugins` holds reactRouter()'s array as a single element. Filtering
  // without flattening inspects the array itself, finds no `name` on it, and
  // silently keeps all sixteen.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: (viteConfig.plugins ?? [])
      .flat(Infinity)
      .filter((plugin) => {
        const name = plugin && typeof plugin === 'object' && 'name' in plugin ? String(plugin.name) : '';
        return !APP_ONLY_PLUGIN_PREFIXES.some((prefix) => name.startsWith(prefix));
      }),
  }),
};

export default config;
