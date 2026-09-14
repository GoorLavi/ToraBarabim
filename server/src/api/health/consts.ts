// Matches no declared route (`client/src/routes.ts`), so it falls through
// to the catch-all 404 route nested under the layout. That route's loader
// only sets a 404 status and the layout above it has none, so rendering it
// never reaches the database.
export const HEALTH_RENDER_PROBE_PATH = '/__health-render-probe';
