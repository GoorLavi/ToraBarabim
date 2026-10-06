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

// ISO 3166-1 alpha-2 codes, as CloudFront expects (0037). Never `US` or
// `IL`: test/site-stack.test.ts, which CI runs, fails if either is added.
export const BLOCKED_VIEWER_COUNTRIES: readonly string[] = ['CN', 'RU'];

// How long the edge may serve sw.js and the manifest without asking the
// origin. Asserted against by test/site-stack.test.ts with its own literal, so
// raising this fails a test instead of quietly delaying a kill switch.
export const SERVICE_WORKER_EDGE_TTL_SECONDS = 60;
