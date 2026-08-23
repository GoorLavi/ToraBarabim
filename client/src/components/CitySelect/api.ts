import type { City } from '@torabarabim/common';

const url = (path: string): URL => new URL(path, window.location.origin);

// GET /v1/cities (the public endpoint, not behind any auth)
// 200, including an empty result set.
// A deliberate small duplicate of `HomePage/api.ts`'s `fetchCities` and
// `AdminPanel/api.ts`'s former `fetchAdminCities`: this component is a
// sibling of both features, not their ancestor, so importing across them
// would break the folder-ownership tree (client/CLAUDE.md, Component Tree).
// Lift into a shared module if a fourth caller appears.
export const fetchCities = (q: string): Promise<{ items: City[] }> => {
  const target = url('/v1/cities');
  target.searchParams.set('q', q);
  return fetch(target.toString()).then((response) => {
    if (!response.ok) throw new Error(`GET ${target.toString()} returned ${response.status}`);
    return response.json() as Promise<{ items: City[] }>;
  });
};
