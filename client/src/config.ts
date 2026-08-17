// Falls back to the server's own default dev port when no build-time override is
// supplied. vite.config.ts fails a production build outright when VITE_API_URL is
// missing, so this fallback is only ever reached in local development; it is
// deliberately fail-open there and fail-closed for a production build. Shared by
// every feature that talks to the API (HomePage and AdminPanel both call it), so it
// lives here rather than inside either feature.
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
