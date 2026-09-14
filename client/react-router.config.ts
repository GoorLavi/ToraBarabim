import type { Config } from '@react-router/dev/config';

// `appDirectory: 'src'`: the framework default is `app`, but this codebase
// already has 300+ files under `src`. This migration moves how a request
// becomes HTML, not where every file lives.
export default {
  appDirectory: 'src',
  ssr: true,
  // Vite 8 runs its own multi-environment build by default; without this
  // flag @react-router/dev@7.18.2 (predating Vite 8's stable Environment
  // API) writes both the client and the server bundle into `build/client`
  // instead of splitting them into `build/client` and `build/server`.
  future: { v8_viteEnvironmentApi: true },
  // The server workspace that mounts this build is CommonJS (server house
  // rules, tsconfig.base.json). TypeScript's CommonJS target compiles
  // `import()` to a synchronous `require()`, not a real dynamic import, so
  // the default `esm` server bundle's CJS/ESM interop breaks (styled-
  // components' default export loses its `.div` etc). `cjs` matches what
  // actually loads it.
  serverModuleFormat: 'cjs',
  // `client/package.json` has `"type": "module"`, so a plain `index.js`
  // would still be loaded as ESM by Node regardless of its CommonJS
  // contents. The `.cjs` extension overrides that per-file.
  serverBuildFile: 'index.cjs',
} satisfies Config;
