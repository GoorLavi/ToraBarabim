import type { AreaSummary, City, LessonOccurrence, LessonVenue, LessonVenuePanel, Place, Rabbi, ResolvedAddress } from '@torabarabim/common';

import { RABBI_HONORIFIC_LABELS, SITE_CONTACT_PHONE_INTERNATIONAL } from './consts';
import type { DayGroup } from './models';

// The one place a rabbi's display name is composed, from the bare stored
// name and the honorific: "הרב אייל עמרמי" or "הרבנית שרה גולדברג". Every
// render site uses this rather than building the string by hand, so the
// honorific can never be dropped or duplicated.
export const rabbiDisplayName = (rabbi: Pick<Rabbi, 'name' | 'honorific'>): string =>
  `${RABBI_HONORIFIC_LABELS[rabbi.honorific]} ${rabbi.name}`;

// `dir="auto"` resolves direction from the value's first strong directional
// character. A value without one, whether empty or only whitespace, falls
// back to `ltr` in Chrome, which puts a Hebrew placeholder and the caret on
// the wrong side of a field the user reads as blank. Forcing `rtl` until
// there is real content, then handing back to `auto`, keeps a genuinely
// Latin value (a Latin place name) rendering LTR.
export const directionForValue = (value: string): 'rtl' | 'auto' => (value.trim() ? 'auto' : 'rtl');

// The one place a rabbi's public path is built, from the id React Router
// matches on and the slug that decorates it for a reader and for search
// results. Hebrew is not ASCII on the wire, so both segments are
// percent-encoded here; a caller never encodes either a second time. `Rabbi`
// (common/src/rabbi.ts) guarantees `slug` is never empty, so there is no
// bare-id fallback to fall back to.
export const rabbiPath = (rabbi: Pick<Rabbi, 'id' | 'slug'>): string =>
  `/rabbis/${encodeURIComponent(rabbi.id)}/${encodeURIComponent(rabbi.slug)}`;

// The one place a city's public path is built. The slug travels on the
// wire (`City.slug`), so this never calls the server's `toSlug` a second
// time in the browser.
export const cityPath = (city: Pick<City, 'slug'>): string => `/cities/${encodeURIComponent(city.slug)}`;

// The one place an area's public path is built, mirroring cityPath.
export const areaPath = (area: Pick<AreaSummary, 'slug'>): string => `/areas/${encodeURIComponent(area.slug)}`;

// The one place a place's public path is built, mirroring rabbiPath: both
// segments percent-encoded, `Place.slug` never empty so there is no bare-id
// fallback to fall back to.
export const placePath = (place: Pick<Place, 'id' | 'slug'>): string => `/places/${encodeURIComponent(place.id)}/${encodeURIComponent(place.slug)}`;

// The one place a lesson occurrence's public path is built, from the lesson
// id React Router matches on and the ISO date of the specific occurrence.
export const lessonPath = (occurrence: Pick<LessonOccurrence, 'lessonId' | 'date'>): string =>
  `/lesson/${encodeURIComponent(occurrence.lessonId)}/${encodeURIComponent(occurrence.date)}`;

// Shared by the city page, the cities directory and the area page: once
// someone has chosen where, the only question left is when (design spec,
// guidance intent). Sorted defensively rather than trusted blind.
export const groupByDay = (items: LessonOccurrence[]): DayGroup[] => {
  const sorted = [...items].sort((a, b) =>
    a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date),
  );

  const groups: DayGroup[] = [];
  for (const item of sorted) {
    const lastGroup = groups.at(-1);
    if (lastGroup && lastGroup.date === item.date) {
      lastGroup.items.push(item);
    } else {
      groups.push({ date: item.date, items: [item] });
    }
  }
  return groups;
};

// True on any difference between a lesson's own venue and one occurrence's
// resolved venue, in any combination the union allows (RabbiPanel's Upcoming
// page and AdminPanel's lesson view both need this to flag a moved date).
// The lesson side is always a panel's own read of its lesson
// (`LessonResponse`/`RabbiLessonResponse`), so it is `LessonVenuePanel`, not
// `LessonVenue`: its address arm carries `cityName` rather than `city`
// (`common/src/venue.ts`), which is why the two sides are compared by
// different field names below rather than sharing one shape.
// An exception's override is always a free-text address, never a place
// reference (`LessonException`), so a lesson venue of 'place' paired with an
// occurrence venue of 'place' is always the same place, and a lesson venue of
// 'address' paired with an occurrence venue of 'place' cannot occur.
export const hasVenueChanged = (lessonVenue: LessonVenuePanel, occurrenceVenue: LessonVenue): boolean => {
  if (lessonVenue.kind === 'place') return occurrenceVenue.kind === 'address';
  // Unreachable while an exception can only override to free text; would
  // become reachable if an exception ever gained its own place reference.
  if (occurrenceVenue.kind === 'place') return false;
  return (
    lessonVenue.name !== occurrenceVenue.name ||
    lessonVenue.street !== occurrenceVenue.street ||
    lessonVenue.cityName !== occurrenceVenue.city
  );
};

// A panel's read of a venue (`LessonResponse`/`RabbiLessonResponse`) puts
// the city's display name on a different field per arm of the union
// (`common/src/venue.ts`, `LessonVenuePanel`): `cityName` when the venue is
// free text, `city` when it names a registered place. Every panel render
// site that only wants the city text goes through this rather than
// re-deriving the split.
export const venuePanelCityName = (venue: LessonVenuePanel): string => (venue.kind === 'place' ? venue.city : venue.cityName);

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const SATURDAY = 6;

const israelDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: ISRAEL_TIME_ZONE });
const longWeekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: ISRAEL_TIME_ZONE });
const dayMonthFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: ISRAEL_TIME_ZONE });

const todayInIsrael = (): string => israelDateFormatter.format(new Date());

const addOneDay = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

// Today and tomorrow name the weekday instead of the date, since the date
// itself is redundant once "today" already says which day it is; every
// other day, including Saturday, names the date (design spec, "Day
// heading"). Saturday drops the weekday word entirely ("שבת", never "יום
// שבת"), which is also the literal output of a "long" weekday format for
// day 6 in he-IL, so no separate branch is needed for it, only for the
// named-day cases that skip the calendar date altogether.
export const dayGroupHeading = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const today = todayInIsrael();

  if (isoDate === today) return `היום, ${longWeekdayFormatter.format(date)}`;
  if (isoDate === addOneDay(today)) return `מחר, ${longWeekdayFormatter.format(date)}`;
  if (date.getUTCDay() === SATURDAY) return `שבת, ${dayMonthFormatter.format(date)}`;
  return `${longWeekdayFormatter.format(date)}, ${dayMonthFormatter.format(date)}`;
};

// Lifted from LessonPage/components/LessonTicket/helpers.ts once the place
// page became a second caller: this is the nearest folder both can see.
// No comma when there is no floor (design spec).
export const addressLine = (street: string, floor: string | undefined): string => (floor ? `${street}, ${floor}` : street);

// Street and city only, never `floor`: a floor is an arrival note ("קומה
// 2"), not part of a geocodable address, and passing it to Waze/Google Maps
// would make the query fail to resolve. Both fields are trimmed here, the
// one place the query string is actually built, so stray whitespace never
// reaches the URL.
const navigationQuery = (place: Pick<ResolvedAddress, 'street' | 'city'>): string => `${place.street.trim()}, ${place.city.trim()}`;

// `undefined` unless both street and city are present, so the caller hides
// the whole nav row rather than link out to a bare street or a bare city
// (fail closed: a navigation link that only narrows down part of the
// address is worse than none).
// The one WhatsApp deep link this site sends a reader to: this site's own
// contact number, prefilled with a caller's own message. `wa.me` wants the
// international number with no leading `+` or separators, which
// `SITE_CONTACT_PHONE_INTERNATIONAL` already is.
export const whatsAppHref = (message: string): string => `https://wa.me/${SITE_CONTACT_PHONE_INTERNATIONAL}?text=${encodeURIComponent(message)}`;

export const wazeHref = (place: Pick<ResolvedAddress, 'street' | 'city'>): string | undefined =>
  place.street.trim() && place.city.trim()
    ? `https://waze.com/ul?q=${encodeURIComponent(navigationQuery(place))}&navigate=yes`
    : undefined;

export const googleMapsHref = (place: Pick<ResolvedAddress, 'street' | 'city'>): string | undefined =>
  place.street.trim() && place.city.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navigationQuery(place))}`
    : undefined;
