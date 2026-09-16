export const CONTAINER_PORT = 3000;

// Read by server-stack.ts and asserted against by test/server-stack.test.ts,
// so a future edit that lowers this back into reachable CPUUtilization
// territory fails the test instead of silently reintroducing the bug fixed
// here: an alarm that could never leave ALARM because a real datapoint could
// always breach it.
export const NO_HEALTHY_TASK_THRESHOLD = 1_000_000;

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
