import type { Lesson, LessonException, Rabbi } from '@torabarabim/common';
import { inArray, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

import { addDays, nextDateOnWeekday } from '../../service/lesson/israel-time';
import type { Tx } from '../client';
import { lessonExceptions, lessons, places, rabbis } from '../schema';

const rabbiInsertSchema = createInsertSchema(rabbis);
const placeInsertSchema = createInsertSchema(places);
const lessonInsertSchema = createInsertSchema(lessons);
const exceptionInsertSchema = createInsertSchema(lessonExceptions);

const RABBIS: Rabbi[] = [
  { id: 'rabbi-1', name: 'הרב אברהם כהן', title: 'ראש ישיבה', bio: 'ראש ישיבת "אור התורה" ומגידי השיעור הוותיקים בעיר.' },
  { id: 'rabbi-2', name: 'הרב משה לוי', title: 'רב שכונה' },
  { id: 'rabbi-3', name: 'הרב יעקב מזרחי', title: 'דיין', bio: 'דיין בבית הדין הרבני ומרצה בנושאי הלכה בת ימינו.' },
  { id: 'rabbi-4', name: 'הרב שלמה אביטן' },
  { id: 'rabbi-5', name: 'הרב דוד עמאר', title: 'רב קהילה' },
  { id: 'rabbi-6', name: 'הרב יצחק פרץ', title: 'ראש כולל', bio: 'ראש כולל אברכים ומחבר ספרים בענייני מוסר.' },
  { id: 'rabbi-7', name: 'הרב אליהו וקנין' },
  { id: 'rabbi-8', name: 'הרב רפאל בן שושן', title: 'מגיד שיעור' },
  { id: 'rabbi-9', name: 'הרבנית שרה גולדברג', title: 'מרצה', bio: 'מרצה לפרשת שבוע ומחשבת ישראל לנשים.' },
  { id: 'rabbi-10', name: 'הרב נתן צבי אשכנזי', title: 'רב בית כנסת' },
  { id: 'rabbi-11', name: 'הרב שמעון אזולאי' },
];

interface PlaceSeed {
  id: string;
  name: string;
  address: string;
  cityName: string;
}

const PLACES: PlaceSeed[] = [
  { id: 'place-1', name: 'בית הכנסת "אוהל יעקב"', address: 'רחוב הרב קוק 12', cityName: 'צפת' },
  { id: 'place-2', name: 'ישיבת "נר דוד"', address: 'שדרות הנשיא 8', cityName: 'חיפה' },
  { id: 'place-3', name: 'בית הכנסת המרכזי', address: 'רחוב ויצמן 45', cityName: 'נתניה' },
  { id: 'place-4', name: 'כולל "בית מדרש עליון"', address: 'רחוב חזון איש 3', cityName: 'בני ברק' },
  { id: 'place-5', name: 'בית הכנסת "היכל שלמה"', address: 'שדרות רוטשילד 20', cityName: 'תל אביב - יפו' },
  { id: 'place-6', name: 'ישיבת "מרכז הרב"', address: 'רחוב הרב קוק 9', cityName: 'ירושלים' },
  { id: 'place-7', name: 'בית הכנסת "שערי תפילה"', address: 'רחוב הרצל 33', cityName: 'רחובות' },
  { id: 'place-8', name: 'בית הכנסת "אור החיים"', address: 'רחוב טרומפלדור 5', cityName: 'באר שבע' },
  { id: 'place-9', name: 'מדרשה לנשים "בית יעל"', address: 'רחוב סוקולוב 14', cityName: 'רעננה' },
  { id: 'place-10', name: 'בית הכנסת "זכרון משה"', address: 'רחוב יפו 88', cityName: 'ירושלים' },
  { id: 'place-11', name: 'אולם אירועים "גני התורה"', address: 'רחוב ההסתדרות 2', cityName: 'אשדוד' },
];

const LESSONS: Lesson[] = [
  { id: 'lesson-1', title: 'דף יומי', rabbiId: 'rabbi-1', placeId: 'place-1', topic: 'gemara', audience: 'men', recurrence: { kind: 'weekly', weekdays: [0, 1, 2, 3, 4] }, startTime: '06:00', durationMinutes: 45 },
  { id: 'lesson-2', title: 'הלכה יומית לחיי המעשה', rabbiId: 'rabbi-2', placeId: 'place-2', topic: 'halacha', audience: 'men', recurrence: { kind: 'weekly', weekdays: [0, 2, 4] }, startTime: '20:30', durationMinutes: 40 },
  { id: 'lesson-3', title: 'עיונים בפרשת השבוע', rabbiId: 'rabbi-3', placeId: 'place-3', topic: 'parasha', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [4] }, startTime: '21:00', durationMinutes: 60, notes: 'השיעור פתוח לכל המשפחה, אין צורך בהרשמה מראש.' },
  { id: 'lesson-4', title: 'שיעור מוסר לפני התפילה', rabbiId: 'rabbi-6', placeId: 'place-4', topic: 'mussar', audience: 'men', recurrence: { kind: 'weekly', weekdays: [1, 3] }, startTime: '05:45', durationMinutes: 30 },
  { id: 'lesson-6', title: 'עולם התנ"ך', rabbiId: 'rabbi-9', placeId: 'place-9', topic: 'tanach', audience: 'women', recurrence: { kind: 'weekly', weekdays: [1] }, startTime: '10:00', durationMinutes: 60 },
  { id: 'lesson-7', title: 'שאלות של אמונה', rabbiId: 'rabbi-11', placeId: 'place-6', topic: 'machshava', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [5] }, startTime: '18:00', durationMinutes: 45 },
  { id: 'lesson-8', title: 'סוגיות בגמרא למתחילים', rabbiId: 'rabbi-4', placeId: 'place-4', topic: 'gemara', audience: 'men', recurrence: { kind: 'weekly', weekdays: [0, 3] }, startTime: '20:00', durationMinutes: 45 },
  { id: 'lesson-9', title: 'הלכות שבת מעשיות', rabbiId: 'rabbi-5', placeId: 'place-5', topic: 'halacha', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [4] }, startTime: '17:30', durationMinutes: 40 },
  { id: 'lesson-10', title: 'טעמו וראו', rabbiId: 'rabbi-7', placeId: 'place-7', topic: 'parasha', audience: 'men', recurrence: { kind: 'weekly', weekdays: [5] }, startTime: '07:30', durationMinutes: 30 },
  { id: 'lesson-11', title: 'שיעור מוסר לנשים', rabbiId: 'rabbi-9', placeId: 'place-9', topic: 'mussar', audience: 'women', recurrence: { kind: 'weekly', weekdays: [3] }, startTime: '20:30', durationMinutes: 45 },
  { id: 'lesson-12', title: 'תניא לעומק', rabbiId: 'rabbi-8', placeId: 'place-2', topic: 'chassidut', audience: 'men', recurrence: { kind: 'weekly', weekdays: [1, 4] }, startTime: '21:15', durationMinutes: 40 },
  { id: 'lesson-13', title: 'נביאים ראשונים', rabbiId: 'rabbi-10', placeId: 'place-10', topic: 'tanach', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [2] }, startTime: '19:30', durationMinutes: 50 },
  { id: 'lesson-14', title: 'מבוא למחשבת ישראל', rabbiId: 'rabbi-3', placeId: 'place-6', topic: 'machshava', audience: 'men', recurrence: { kind: 'weekly', weekdays: [0] }, startTime: '21:00', durationMinutes: 60 },
  { id: 'lesson-15', title: 'שיעור כללי בעיון', rabbiId: 'rabbi-1', placeId: 'place-1', topic: 'gemara', audience: 'men', recurrence: { kind: 'weekly', weekdays: [5] }, startTime: '11:00', durationMinutes: 60 },
  { id: 'lesson-16', title: 'הלכות ברכות', rabbiId: 'rabbi-2', placeId: 'place-3', topic: 'halacha', audience: 'men', recurrence: { kind: 'weekly', weekdays: [1] }, startTime: '20:00', durationMinutes: 30 },
  { id: 'lesson-17', title: 'אור לעמי', rabbiId: 'rabbi-6', placeId: 'place-11', topic: 'mussar', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [2, 4] }, startTime: '20:45', durationMinutes: 45 },
  { id: 'lesson-18', title: 'אישים בתנ"ך', rabbiId: 'rabbi-9', placeId: 'place-9', topic: 'tanach', audience: 'women', recurrence: { kind: 'weekly', weekdays: [0] }, startTime: '09:30', durationMinutes: 45 },
  { id: 'lesson-19', title: 'פרשת השבוע לילדים ולהורים', rabbiId: 'rabbi-5', placeId: 'place-5', topic: 'parasha', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [5] }, startTime: '16:00', durationMinutes: 30 },
  // Minimal on purpose: no notes, and its rabbi and place have no optional
  // fields, so the client's layout is tested against thin data too.
  { id: 'lesson-21', title: 'שיעור פתוח', rabbiId: 'rabbi-4', placeId: 'place-8', topic: 'other', audience: 'mixed', recurrence: { kind: 'weekly', weekdays: [3] }, startTime: '19:00', durationMinutes: 45 },
  { id: 'lesson-22', title: 'שולחן ערוך יומי', rabbiId: 'rabbi-3', placeId: 'place-10', topic: 'halacha', audience: 'men', recurrence: { kind: 'weekly', weekdays: [0, 1, 2, 3, 4] }, startTime: '13:00', durationMinutes: 20 },
  { id: 'lesson-23', title: 'ערב עיון בפרשת השבוע', rabbiId: 'rabbi-11', placeId: 'place-6', topic: 'parasha', audience: 'men', recurrence: { kind: 'weekly', weekdays: [4] }, startTime: '22:00', durationMinutes: 60 },
];

const buildOnceLessons = (todayIso: string): Lesson[] => [
  { id: 'lesson-24', title: 'מעמד הכנה לראש חודש', rabbiId: 'rabbi-8', placeId: 'place-2', topic: 'other', audience: 'mixed', recurrence: { kind: 'once', date: addDays(todayIso, 5) }, startTime: '20:00', durationMinutes: 90, notes: 'מעמד מיוחד לכבוד ראש חודש, בהשתתפות אורחים.' },
  { id: 'lesson-25', title: 'יום עיון בהלכות המועדים', rabbiId: 'rabbi-6', placeId: 'place-4', topic: 'halacha', audience: 'men', recurrence: { kind: 'once', date: addDays(todayIso, 19) }, startTime: '17:00', durationMinutes: 120 },
];

const buildExceptions = (todayIso: string): LessonException[] => {
  const cancelledDate = nextDateOnWeekday(todayIso, 3); // lesson-21's Wednesday slot
  const substituteDate = nextDateOnWeekday(todayIso, 4); // lesson-3's Thursday slot
  const modifiedDate = nextDateOnWeekday(todayIso, 1); // lesson-16's Monday slot

  return [
    {
      kind: 'cancelled',
      lessonId: 'lesson-21',
      date: cancelledDate,
      reason: 'השיעור מבוטל השבוע עקב אירוע משפחתי אצל הרב',
    },
    {
      kind: 'modified',
      lessonId: 'lesson-3',
      date: substituteDate,
      substituteRabbiId: 'rabbi-7',
      note: 'הרב מזרחי בנסיעה, השיעור יועבר הפעם על ידי הרב וקנין',
    },
    {
      kind: 'modified',
      lessonId: 'lesson-16',
      date: modifiedDate,
      startTime: '20:30',
      note: 'השיעור עבר לשעה מאוחרת יותר השבוע',
    },
    {
      kind: 'modified',
      lessonId: 'lesson-9',
      date: nextDateOnWeekday(todayIso, 4),
      placeId: 'place-11',
      note: 'השיעור עובר הפעם לאולם "גני התורה" עקב עבודות בבית הכנסת',
    },
  ];
};

const toLessonInsert = (lesson: Lesson): typeof lessons.$inferInsert =>
  lessonInsertSchema.parse({
    id: lesson.id,
    title: lesson.title,
    rabbiId: lesson.rabbiId,
    placeId: lesson.placeId,
    topic: lesson.topic,
    audience: lesson.audience,
    recurrenceKind: lesson.recurrence.kind,
    recurrenceWeekdays: lesson.recurrence.kind === 'weekly' ? lesson.recurrence.weekdays : null,
    recurrenceDate: lesson.recurrence.kind === 'once' ? lesson.recurrence.date : null,
    startTime: lesson.startTime,
    durationMinutes: lesson.durationMinutes,
    notes: lesson.notes ?? null,
  });

const toExceptionInsert = (exception: LessonException): typeof lessonExceptions.$inferInsert =>
  exceptionInsertSchema.parse(
    exception.kind === 'cancelled'
      ? { lessonId: exception.lessonId, date: exception.date, kind: 'cancelled', reason: exception.reason ?? null }
      : {
          lessonId: exception.lessonId,
          date: exception.date,
          kind: 'modified',
          startTime: exception.startTime ?? null,
          placeId: exception.placeId ?? null,
          substituteRabbiId: exception.substituteRabbiId ?? null,
          note: exception.note ?? null,
        },
  );

const SEED_LESSON_IDS = LESSONS.map((lesson) => lesson.id);

export const seedLessons = async (
  tx: Tx,
  cityCodeByName: Map<string, number>,
  todayIso: string,
): Promise<void> => {
  const placeRows = PLACES.map((place) => {
    const cityId = cityCodeByName.get(place.cityName);
    if (cityId === undefined) {
      throw new Error(`expected city '${place.cityName}' to exist for place ${place.id}, but it was not found`);
    }
    return placeInsertSchema.parse({ id: place.id, name: place.name, address: place.address, cityId });
  });

  await tx
    .insert(rabbis)
    .values(RABBIS.map((rabbi) => rabbiInsertSchema.parse(rabbi)))
    .onConflictDoUpdate({
      target: rabbis.id,
      set: {
        name: sql`excluded.name`,
        title: sql`excluded.title`,
        photoUrl: sql`excluded.photo_url`,
        bio: sql`excluded.bio`,
      },
    });

  await tx
    .insert(places)
    .values(placeRows)
    .onConflictDoUpdate({
      target: places.id,
      set: { name: sql`excluded.name`, address: sql`excluded.address`, cityId: sql`excluded.city_id` },
    });

  await tx
    .insert(lessons)
    .values([...LESSONS, ...buildOnceLessons(todayIso)].map(toLessonInsert))
    .onConflictDoUpdate({
      target: lessons.id,
      set: {
        title: sql`excluded.title`,
        rabbiId: sql`excluded.rabbi_id`,
        placeId: sql`excluded.place_id`,
        topic: sql`excluded.topic`,
        audience: sql`excluded.audience`,
        recurrenceKind: sql`excluded.recurrence_kind`,
        recurrenceWeekdays: sql`excluded.recurrence_weekdays`,
        recurrenceDate: sql`excluded.recurrence_date`,
        startTime: sql`excluded.start_time`,
        durationMinutes: sql`excluded.duration_minutes`,
        notes: sql`excluded.notes`,
      },
    });

  // The demo exceptions are dated relative to "today", so re-running the
  // seed on a different day would upsert nothing and leave yesterday's
  // rows behind; delete this seed's exceptions and reinsert instead.
  await tx.delete(lessonExceptions).where(inArray(lessonExceptions.lessonId, SEED_LESSON_IDS));
  await tx.insert(lessonExceptions).values(buildExceptions(todayIso).map(toExceptionInsert));
};
