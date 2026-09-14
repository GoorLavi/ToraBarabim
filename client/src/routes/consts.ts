import type { CityDirectoryResponse, LessonOccurrence, Rabbi, RabbiDirectoryResponse } from '@torabarabim/common';

import type { JsonLdObject } from './models';

import { TITLE as CONTACT_TITLE } from '~/ContactPage/consts';
import { kickerLabel } from '~/LessonPage/components/LessonTicket/helpers';
import { TITLE_UNFILTERED as LESSONS_TITLE } from '~/LessonsPage/consts';
import { cityPath, rabbiPath } from '~/helpers';

import { SITE_NAME, SITE_ORIGIN } from '../../consts';

// Shared by every server-rendered route's loader and `headers` export.

// An error response must never sit behind the CDN's success caching (the
// spike defect: a 500 while the database was down was cached as a normal
// page for five minutes). Every loader throws a Response carrying this
// header on a failure path, and every route's `headers` falls back to it
// through `errorHeaders`.
export const UNCACHEABLE_ERROR_HEADERS = { 'Cache-Control': 'no-store' };

// The default success caching for a server-rendered document: short enough
// that a change (a rabbi's photo, today's home rows) is never stale for
// long, long enough to keep most requests off this container. Also used on
// the canonical redirect a route issues for a bare-id or stale-slug URL,
// since that redirect is exactly as fresh as the success response it points
// at.
export const PUBLIC_CACHE_HEADERS = { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' };

// sitemap.ts's own success caching: the file changes only when a rabbi, a
// city or an area gains its first lesson, so a full day at the edge costs
// nothing a crawler would notice, unlike PUBLIC_CACHE_HEADERS's minute-scale
// window for a page whose rows can change on every lesson entered. Mirrored
// by infra/lib/site-stack.ts's `SitemapCachePolicy`, so local development
// and the CDN agree on the same window.
export const SITEMAP_CACHE_HEADERS = { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' };

// home.tsx's own ErrorBoundary copy. A loader failure needs a route-level
// boundary here, not just root.tsx's, so `headers()` sees `errorHeaders` and
// keeps this route's 500 out of the CDN's success caching the same way the
// rabbi route's own boundary does.
export const HOME_ERROR_HEADING = 'לא הצלחנו לטעון את הדף';
export const HOME_ERROR_BODY = 'משהו השתבש בטעינת השיעורים. אפשר לנסות לרענן את הדף.';
export const HOME_ERROR_RELOAD_LABEL = 'רענון הדף';

// cities.tsx's own document title and description, not in-page copy:
// CitiesPage/consts.ts owns what a visitor reads on the page itself.
export const citiesPageTitle = (): string => `כל הערים | שיעורי תורה לפי עיר ואזור | ${SITE_NAME}`;

export const citiesPageDescription = (directory: CityDirectoryResponse): string => {
  const cityCount = directory.areas.reduce((total, group) => total + group.cities.length, 0);
  return `כל הערים והאזורים שיש בהם שיעורי תורה, ${cityCount} ערים בפריסה ארצית, ב${SITE_NAME}.`;
};

// cities.tsx's own structured data: every city shown in the initial HTML,
// in the order the directory groups them, each with its canonical URL
// (`cityPath`) so this and the page's own `canonical` tag never disagree.
export const citiesItemListJsonLd = (directory: CityDirectoryResponse): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: directory.areas
    .flatMap((group) => group.cities)
    .map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_ORIGIN}${cityPath(city)}`,
      name: city.name,
    })),
});

// rabbis.tsx's own document title and description, not in-page copy:
// RabbisPage/consts.ts owns what a visitor reads on the page itself.
export const rabbisPageTitle = (): string => `כל הרבנים | שיעורי תורה לפי רב | ${SITE_NAME}`;

export const rabbisPageDescription = (directory: RabbiDirectoryResponse): string =>
  `כל הרבנים שמלמדים שיעורי תורה, ${directory.total} רבנים, ב${SITE_NAME}.`;

// rabbis.tsx's own structured data, mirroring citiesItemListJsonLd: every
// rabbi in the loaded page, each with its canonical URL (`rabbiPath`).
export const rabbisItemListJsonLd = (directory: RabbiDirectoryResponse): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: directory.items.map((rabbi, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_ORIGIN}${rabbiPath(rabbi)}`,
    name: rabbi.name,
  })),
});

// lesson.tsx's own document title, description and structured data, not
// in-page copy: LessonPage/consts.ts owns what a visitor reads on the page
// itself. Shares the ticket's own kicker fallback (title, else topic) so
// the two never describe the same lesson differently; a lesson with
// neither falls back to a generic subject rather than an empty one.
const lessonSubjectLabel = (occurrence: LessonOccurrence): string => kickerLabel(occurrence) ?? 'שיעור תורה';

export const lessonPageTitle = (occurrence: LessonOccurrence, teachingRabbi: Rabbi): string =>
  `${lessonSubjectLabel(occurrence)} עם ${teachingRabbi.name} | ${SITE_NAME}`;

export const lessonPageDescription = (occurrence: LessonOccurrence, teachingRabbi: Rabbi): string => {
  const subject = lessonSubjectLabel(occurrence);
  if (occurrence.status === 'cancelled') {
    return `השיעור "${subject}" עם ${teachingRabbi.name} בוטל בתאריך זה. אפשר לחפש שיעורים אחרים ב${occurrence.place.city} ב${SITE_NAME}.`;
  }
  return `${subject} עם ${teachingRabbi.name} ב${occurrence.place.city}, ${occurrence.place.name}. פרטים מלאים ב${SITE_NAME}.`;
};

const JERUSALEM_OFFSET_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jerusalem',
  timeZoneName: 'longOffset',
  hour: 'numeric',
});

// schema.org's `startDate`/`endDate` need a real UTC offset, not just the
// bare wall-clock time an occurrence carries: Israel's clock shifts between
// +02:00 and +03:00 across the DST boundary within the same lesson season,
// so a fixed offset would misreport roughly half the year. Read off the
// actual IANA zone for the occurrence's own date rather than hand-coding
// the transition dates.
const israelUtcOffset = (isoDate: string): string => {
  const zoneName = JERUSALEM_OFFSET_FORMATTER.formatToParts(new Date(`${isoDate}T12:00:00Z`)).find(
    (part) => part.type === 'timeZoneName',
  )?.value;
  return zoneName?.replace('GMT', '') || '+00:00';
};

const israelDateTime = (isoDate: string, clockTime: string): string => `${isoDate}T${clockTime}:00${israelUtcOffset(isoDate)}`;

// lesson.tsx's own structured data. `performer` is whoever actually teaches
// this occurrence (LessonPage/helpers.ts's `teachingRabbiOf`), never the
// lesson's own rabbi when a substitute is assigned, and a cancelled
// occurrence says so through `eventStatus` rather than silently describing
// a lesson that is not happening.
export const lessonEventJsonLd = (occurrence: LessonOccurrence, teachingRabbi: Rabbi): JsonLdObject => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `${lessonSubjectLabel(occurrence)} עם ${teachingRabbi.name}`,
  startDate: israelDateTime(occurrence.date, occurrence.startTime),
  endDate: israelDateTime(occurrence.date, occurrence.endTime),
  eventStatus:
    occurrence.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: occurrence.place.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: occurrence.place.street,
      addressLocality: occurrence.place.city,
      addressCountry: 'IL',
    },
  },
  performer: {
    '@type': 'Person',
    name: teachingRabbi.name,
    url: `${SITE_ORIGIN}${rabbiPath(teachingRabbi)}`,
    ...(teachingRabbi.bio ? { description: teachingRabbi.bio } : {}),
    ...(teachingRabbi.photoUrl ? { image: teachingRabbi.photoUrl } : {}),
  },
});

// contact.tsx's and lessons.tsx's own document titles and descriptions.
// Every public route needs its own, because root.tsx's defaults describe the
// home page, including a canonical pointing at `/`: React Router replaces a
// parent's meta entry rather than merging into it, so a route with no `meta`
// export of its own tells a crawler it is a copy of the home page. That is
// the exact instruction decision 0023 exists to undo.
export const contactPageTitle = (): string => `${CONTACT_TITLE} | ${SITE_NAME}`;
export const CONTACT_PAGE_DESCRIPTION =
  'איך ליצור איתנו קשר בכל דבר שקשור ללוח השיעורים: שיעור חסר, פרט לא מדויק, או בקשה להוסיף מגיד שיעור.';

export const lessonsPageTitle = (): string => `${LESSONS_TITLE} | ${SITE_NAME}`;
export const LESSONS_PAGE_DESCRIPTION =
  'כל שיעורי התורה בלוח, לפי יום ולפי מקום. אפשר לסנן לפי עיר, לפי תאריך ולפי מה שמחפשים.';
