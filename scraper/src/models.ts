import type { City } from '@torabarabim/common';

// What the scraper reads out of the cities table: the fields it matches a
// raw city name against, and nothing else. `City` itself carries a `slug`,
// which exists so a browser can build a city page's URL; the scraper never
// builds a URL, and it deliberately does not import server's private src
// (see db/cities.ts), so it has no access to the one function that defines
// the slug rule. Narrowing here is what keeps that rule from being
// implemented a second time.
export type CityRecord = Pick<City, 'id' | 'name' | 'area'>;
