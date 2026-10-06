import type { Area, LessonVenue } from '@torabarabim/common';

// Cards of an area rail sit in real cities of that area, and each card has
// its own title rather than repeating the row title.
const AREA_CITIES: Record<Area, [string, string]> = {
  north: ['קריית שמונה', 'צפת'],
  haifa: ['חיפה', 'קריית אתא'],
  sharon: ['נתניה', 'רעננה'],
  center: ['פתח תקווה', 'ראשון לציון'],
  telAviv: ['תל אביב-יפו', 'בני ברק'],
  jerusalem: ['ירושלים', 'בית שמש'],
  shfela: ['מודיעין-מכבים-רעות', 'רחובות'],
  south: ['באר שבע', 'אופקים'],
};

const LESSON_TITLES = ['דף יומי בגמרא', 'הלכות שבת', 'עיונים בפרשת השבוע', 'מוסר ויראת שמים', 'חסידות והלכה', 'פרקי אבות'];

const DEFAULT_AREA: Area = 'sharon';

const isArea = (value: string): value is Area => value in AREA_CITIES;

// Rows that are not an area row (today, weekly, ...) have no area of their own.
const areaOfRow = (rowId: string): Area => {
  const area = rowId.startsWith('area:') ? rowId.slice('area:'.length) : undefined;
  return area !== undefined && isArea(area) ? area : DEFAULT_AREA;
};

export const homeRowCardVenue = (rowId: string, cardIndex: number): Extract<LessonVenue, { kind: 'address' }> => {
  const area = areaOfRow(rowId);
  const cityName = AREA_CITIES[area][cardIndex % 2] ?? AREA_CITIES[DEFAULT_AREA][0];
  return { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: cityName, citySlug: cityName, area };
};

export const homeRowCardTitle = (rowId: string, cardIndex: number): string =>
  LESSON_TITLES[(rowId.length + cardIndex) % LESSON_TITLES.length] ?? LESSON_TITLES[0] ?? '';
