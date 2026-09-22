import * as areaService from '../../../server/src/service/area/area';
import * as cityService from '../../../server/src/service/city/city';
import * as lessonService from '../../../server/src/service/lesson/lesson';
import * as placeService from '../../../server/src/service/place/place';
import * as rabbiService from '../../../server/src/service/rabbi/rabbi';
import { SITE_ORIGIN } from '../../consts';
import { areaPath, cityPath, placePath, rabbiPath } from '../helpers';
import { SITEMAP_CACHE_HEADERS, UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service and database
// code below is excluded from the browser bundle.

// `&` is the realistic hazard in a Hebrew, percent-encoded URL; there is no
// unescaped `<` or `"` in anything the path builders produce, but `<` and
// `>` are escaped too rather than trusting the data to stay that way.
const escapeXmlText = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urlEntry = (path: string): string => `  <url>\n    <loc>${escapeXmlText(`${SITE_ORIGIN}${path}`)}</loc>\n  </url>`;

const STATIC_PATHS = ['/', '/cities', '/rabbis', '/places', '/contact', '/women', '/women/rabbaniyot'];

// Individual lesson occurrences are deliberately not listed. A recurring
// lesson expands to one URL per date in the search window, so listing them
// would mean thousands of entries that go stale every day, and a sitemap
// full of URLs that stopped existing is worse than one that omits them.
// They stay reachable by crawling: the home, city and area pages link every
// occurrence they show.

// `rabbiService.list` paginates for its normal caller, the rabbi directory
// page; the sitemap needs every rabbi in one pass, so this asks for a page
// far past the table's real size rather than looping pages, which would
// turn one query into several for a table this small.
const ALL_RABBIS_PAGE_SIZE = 100_000;

// Same reasoning as `ALL_RABBIS_PAGE_SIZE`, for the one search below that
// decides which places have anything upcoming: one page far past the
// realistic occurrence count for the service's own default window, rather
// than looping pages.
const ALL_OCCURRENCES_PAGE_SIZE = 100_000;

const buildSitemapXml = async (): Promise<string> => {
  const now = new Date();
  const [generalRabbis, womenRabbis, cityDirectory, areaDirectory, placeDirectory, generalOccurrences, womenOccurrences] =
    await Promise.all([
      rabbiService.list({ scope: 'general', page: 1, pageSize: ALL_RABBIS_PAGE_SIZE }),
      rabbiService.list({ scope: 'women', page: 1, pageSize: ALL_RABBIS_PAGE_SIZE }),
      cityService.listDirectory(),
      areaService.listDirectory(),
      placeService.list(),
      lessonService.search({ scope: 'general', status: 'scheduled', page: 1, pageSize: ALL_OCCURRENCES_PAGE_SIZE }, now),
      lessonService.search({ scope: 'women', status: 'scheduled', page: 1, pageSize: ALL_OCCURRENCES_PAGE_SIZE }, now),
    ]);

  const rabbiUrls = [...generalRabbis.items, ...womenRabbis.items].map(rabbiPath);
  const cityUrls = cityDirectory.areas.flatMap((group) => group.cities.map(cityPath));
  const areaUrls = areaDirectory.areas.map(areaPath);

  // `placeService.list` already excludes an inactive place, so this only has
  // to decide the other axis: an active place with nothing scheduled in the
  // service's own default "upcoming" window stays out of the sitemap until
  // it has something, but is never `noindex`ed, which would make Google slow
  // to re-add it once it does. A deactivated place still 404s immediately on
  // its own URL regardless of how long it lingers here: the sitemap is a
  // hint, the status is the truth.
  const placeIdsWithUpcomingLessons = new Set(
    [...generalOccurrences.items, ...womenOccurrences.items].flatMap((occurrence) =>
      occurrence.venue.kind === 'place' ? [occurrence.venue.placeId] : [],
    ),
  );
  const placeUrls = placeDirectory.items.filter((place) => placeIdsWithUpcomingLessons.has(place.id)).map(placePath);

  // Defensive, not load-bearing: every source above already yields each URL
  // exactly once (a city or a rabbi row belongs to exactly one group), but a
  // sitemap that ever repeated a URL is precisely the defect this route
  // exists to prevent, so the dedup travels with the build rather than
  // trusting three services to stay that way forever.
  const urls = [...new Set([...STATIC_PATHS, ...rabbiUrls, ...cityUrls, ...areaUrls, ...placeUrls])];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(urlEntry).join('\n')}\n</urlset>\n`;
};

// Fail closed: on a database error this answers a 500, the same failure
// mode cities.server.ts and city-detail.server.ts already use, rather than
// serving an empty-but-well-formed sitemap. An empty sitemap tells Google
// this site now has zero pages; a 500 is read as a transient fetch failure
// and retried, which is the accurate story while the database is briefly
// unreachable.
export const buildSitemapResponse = async (): Promise<Response> => {
  try {
    const xml = await buildSitemapXml();
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', ...SITEMAP_CACHE_HEADERS },
    });
  } catch (error) {
    console.error('Failed to build sitemap.xml', { error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
