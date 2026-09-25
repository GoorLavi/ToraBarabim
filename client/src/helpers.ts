import type { AreaSummary, City, CloseReason, CourseTopic, LessonOccurrence, LessonVenue, LessonVenuePanel, Place, Rabbi, ResolvedAddress } from '@torabarabim/common';

import { LESSON_TOPIC_LABELS, RABBI_HONORIFIC_LABELS } from './consts';
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

// The one place a course's public path is built, mirroring rabbiPath and
// placePath: both segments percent-encoded. Typed against a minimal shape
// rather than the wire `CourseSummary`, so any caller with just an id and a
// slug (a fixture, a narrower response) can build the same path.
export const coursePath = (course: { id: string; slug: string }): string => `/courses/${encodeURIComponent(course.id)}/${encodeURIComponent(course.slug)}`;

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

// A course's own fixed calendar fact ("יום שני, 3 בנובמבר"), read by a
// panel record's own opening-date field: unlike `dayGroupHeading` above,
// this never turns relative ("היום"/"מחר"), since a record shows the same
// text regardless of when it is viewed.
export const weekdayAndDayMonthLabel = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
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

// A WhatsApp deep link prefilled with a caller's own message, to a number
// the caller passes explicitly (this site's own support line, or a
// course's contact number, converted first through `phoneToInternational`
// below). `wa.me` wants the international number with no leading `+` or
// separators, which `SITE_CONTACT_PHONE_INTERNATIONAL` already is.
export const whatsAppHref = (message: string, phoneInternational: string): string =>
  `https://wa.me/${phoneInternational}?text=${encodeURIComponent(message)}`;

const ISRAEL_COUNTRY_CODE = '972';

// A course's own `contactPhone` is stored (and returned on the wire) as a
// local mobile number, `^05\d{8}$` (server's own validation): the leading
// `0` is the trunk prefix, dropped and replaced with the country code for
// anything that needs the international form, `wa.me` and a `tel:` link
// alike.
export const phoneToInternational = (localPhone: string): string => `${ISRAEL_COUNTRY_CODE}${localPhone.slice(1)}`;

// "050-123-4567", the way an Israeli reader expects a mobile number, for
// display and for a call button's accessible name.
export const phoneDisplay = (localPhone: string): string => `${localPhone.slice(0, 3)}-${localPhone.slice(3, 6)}-${localPhone.slice(6)}`;

// `undefined` unless both street and city are present, so the caller hides
// the whole nav row rather than link out to a bare street or a bare city
// (fail closed: a navigation link that only narrows down part of the
// address is worse than none).
export const wazeHref = (place: Pick<ResolvedAddress, 'street' | 'city'>): string | undefined =>
  place.street.trim() && place.city.trim()
    ? `https://waze.com/ul?q=${encodeURIComponent(navigationQuery(place))}&navigate=yes`
    : undefined;

export const googleMapsHref = (place: Pick<ResolvedAddress, 'street' | 'city'>): string | undefined =>
  place.street.trim() && place.city.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(navigationQuery(place))}`
    : undefined;

const COURSE_OPENING_DATE_PREFIX = 'פתיחה ב־';

// A regular space, in a day-and-month or a count-and-noun pair, lets the
// pair split across a line break with the number stranded on its own
// (design brief B, item 3: "day and month, and every count, are joined
// with no-break spaces"). Every course date and count on the site is built
// through the two helpers below rather than a raw template string, so this
// is the one place that can drift.
const NBSP = ' ';

const courseCompactDateFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric', timeZone: ISRAEL_TIME_ZONE });

// "20 בנובמבר", no prefix: the panel's own lines build their own sentence
// around a bare date ("נסגרה ב־20 בנובמבר · ..."), unlike the public card's
// "פתיחה ב־" wording. Shares `dayMonthFormatter` above (day/month, `he-IL`,
// `long`) rather than a second copy of the same formatter.
export const israelDayMonthLabel = (isoDate: string): string => dayMonthFormatter.format(new Date(`${isoDate}T00:00:00Z`)).replace(' ', NBSP);

// A course's own opening date, on a card (the long form) or in a narrow
// rail-tier card (the compact numeric form): the one place both read from,
// so a panel row's own date never drifts from the card's own wording.
export const courseOpeningDateLongLabel = (isoDate: string): string => `${COURSE_OPENING_DATE_PREFIX}${israelDayMonthLabel(isoDate)}`;

export const courseOpeningDateCompactLabel = (isoDate: string): string =>
  `${COURSE_OPENING_DATE_PREFIX}${courseCompactDateFormatter.format(new Date(`${isoDate}T00:00:00Z`))}`;

// `dual`, when given, is the special two-form a few Hebrew nouns have
// ("שבועיים", "שעתיים"): not every noun has one ("מפגשים" has none, so its
// own count of 2 is just "2 מפגשים", the same shape every other count uses).
export const singularOrCount = (count: number, singular: string, pluralNoun: string, dual?: string): string => {
  if (count === 1) return singular;
  if (count === 2 && dual) return dual;
  return `${count}${NBSP}${pluralNoun}`;
};

// Joins facts with "·", the space before it non-breaking (bound to the
// item before it, design brief B item 3) and the space after it a normal
// one.
export const joinWithMiddleDot = (parts: string[]): string => parts.join(`${NBSP}· `);

// A course's own weeks count, in words: the one place "שבוע אחד" /
// "שבועות" / "שבועיים" are spelled out, read by every screen that states a
// course's length (the facts list, every panel row, the closed panel).
export const weeksPhrase = (weeks: number): string => singularOrCount(weeks, 'שבוע אחד', 'שבועות', 'שבועיים');

// היקף's value shape (spec section 13): "10 שבועות · 10 מפגשים · 15 שעות",
// hours dropped when not given, each count in its singular form ("שבוע
// אחד") when it is exactly 1. Shared by the course page's facts list and
// every panel row, so none of them can say it two different ways.
export const formatCourseScope = (weeks: number, sessions: number, hours: number | undefined): string => {
  const parts = [weeksPhrase(weeks), singularOrCount(sessions, 'מפגש אחד', 'מפגשים')];
  if (hours !== undefined) parts.push(singularOrCount(hours, 'שעה אחת', 'שעות', 'שעתיים'));
  return joinWithMiddleDot(parts);
};

// A closed or full course's own tag-and-line row, shared by every panel
// that lists or records one (the rabbi and admin course lists, and both
// panels' own record pages): "נסגרה ב־20 בנובמבר · הקורס יורד מהרשימות
// באתר ב־27 בנובמבר", "סומן" in place of "נסגרה" when the reason is
// `full` (never "תפוסה מלאה מ־", which would repeat the tag beside it),
// and "ירד" once the course has actually left the public lists (editor's
// exact wording, pass 2 brief).
// Whether a closed course is still on the public lists (its own week has
// not yet passed): read by `courseClosedLineLabel` below for its verb, and
// by the panels' own read-only records to decide whether "לעמוד הקורס
// באתר" still applies.
export const courseStillListed = (leavesListsOn: string): boolean => todayInIsrael() < leavesListsOn;

// "סומן" when the reason is `full`, "נסגרה" otherwise: the one place this
// verb pair is spelled out, read by every closed-or-full line across both
// panels' lists and records.
export const closedVerb = (reason: CloseReason): string => (reason === 'full' ? 'סומן' : 'נסגרה');

// "סומן ב־1 באוקטובר": non-breaking between the verb and the date that
// names it, the same as `israelDayMonthLabel`'s own day-and-month pair, so
// a narrow card never splits the verb from its own date (design gate round
// 2 finding). Shared by both panels' own closed-line builders below.
export const closedVerbWithDateLabel = (reason: CloseReason, isoDate: string): string => `${closedVerb(reason)}${NBSP}ב־${israelDayMonthLabel(isoDate)}`;

export const courseClosedLineLabel = (lifecycle: { reason: CloseReason; closedOn: string; leavesListsOn: string }): string => {
  const leaveVerb = courseStillListed(lifecycle.leavesListsOn) ? 'יורד' : 'ירד';
  return `${closedVerbWithDateLabel(lifecycle.reason, lifecycle.closedOn)} · הקורס ${leaveVerb} מהרשימות באתר ב־${israelDayMonthLabel(lifecycle.leavesListsOn)}`;
};

const priceFormatter = new Intl.NumberFormat('he-IL');

// A plain integer with a thousands comma ("2,000", "100,000"): the one
// place this formatting happens, so a count named in an error message and a
// price never drift on how they group digits.
export const formatNumber = (value: number): string => priceFormatter.format(value);

// "350 ₪ לכל הקורס", with a thousands comma for a four-digit price and up.
// Lifted from `CoursePage/helpers.ts` once the rabbi panel's own read-only
// course record became a second caller.
export const formatPriceShekels = (priceShekels: number): string => `${formatNumber(priceShekels)} ₪ לכל הקורס`;

// `other` carries its own free text; every other value reads the shared
// lesson topic vocabulary (`LESSON_TOPIC_LABELS`), the same set the lesson
// card, row and ticket already show. Lifted alongside `formatPriceShekels`
// above, for the same reason.
export const courseTopicLabel = (topic: CourseTopic): string => (topic.value === 'other' ? topic.otherText : LESSON_TOPIC_LABELS[topic.value]);

// A two-word Hebrew status phrase split for the corner seal's two lines
// (the qualifying word small, the state word big): the one place this
// split happens, so the public course card and the admin's own preview
// card draw the same shape from the same three phrases
// (COURSE_STATE_TAG_OPEN/FULL/CLOSED, ~/consts.ts).
export const stateSealParts = (label: string): { small: string; big: string } => {
  const [small, big = ''] = label.split(' ');
  return { small: small ?? '', big };
};

// Decodes a file into an `<img>` to read its own real pixel dimensions: the
// course cover's own soft-floor warning (both course photo hooks and
// `CourseFormFields/useCreateCoverWarning.ts`), `PhotoPicker/helpers.ts`'s
// own size-capping, and their own stories, all read the same decoded file
// rather than each keeping a separate copy of this. Resolves the `image`
// element itself, not only its dimensions, since a caller that draws it to
// canvas (`capPhotoSize`) needs that same decoded element rather than
// decoding a second one. Named for the live `objectUrl` it hands back too:
// every caller owns revoking it, once it is done with whichever of the two
// it actually needed.
export const decodeImageFile = (file: File): Promise<{ objectUrl: string; image: HTMLImageElement; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ objectUrl, image, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`failed to read image dimensions for ${file.name}`));
    };
    image.src = objectUrl;
  });
