// Falls back to the server's own default dev port when no build-time
// override is supplied; there is no client .env yet. Shared by every
// feature that talks to the API (HomePage and AdminPanel both call it),
// so it lives here rather than inside either feature.
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
