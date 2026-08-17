export const CONTAINER_PORT = 3000;

// Passed to every DockerImageAsset so staging a build context from the repo
// root does not also copy `infra/cdk.out` (the staging output itself) back
// into the context it is being copied into.
export const DOCKER_BUILD_CONTEXT_EXCLUDES = [
  '**/node_modules',
  '.git',
  '**/dist',
  'infra/cdk.out',
  'client/.vite',
  'scraper/.cache',
  'scraper/output',
  '**/*.log',
  '.env',
  '**/.DS_Store',
  '**/coverage',
];
