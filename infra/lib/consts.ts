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

// ISO 3166-1 alpha-2 codes CloudFront refuses at the edge (0037). Only a
// country with no audience and heavy automated traffic belongs here. The
// crawlers this site wants, Google's, OpenAI's and Anthropic's, all fetch
// from the United States, so `US` must never appear; test/site-stack.test.ts
// fails if it does.
export const BLOCKED_VIEWER_COUNTRIES = ['CN', 'RU'];
