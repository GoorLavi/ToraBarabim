import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

import storage from '../../storage/storage';
import { courseColumnsFrom } from '../../service/shared/course-write';
import { addDays } from '../../service/lesson/israel-time';
import type { Tx } from '../client';
import { courses } from '../schema';
import { generatePortraitPng } from './generate-portrait';

const courseInsertSchema = createInsertSchema(courses);

export const SEED_COURSE_IDS = ['course-1', 'course-2', 'course-3', 'course-4', 'course-5', 'course-6'] as const;

// Uploads a deterministic placeholder cover for every seeded course, through
// the same storage path a real create uses. Unlike `uploadSeedPortraits`,
// this keeps the storage *key*, not the returned URL: `courses.cover_key`
// stores a key, and `storage.publicUrl` builds the display URL from it at
// read time (0005's cleanup-leak answer for this table). Runs before the
// seed transaction: it is network I/O against object storage, not a
// database write.
export const uploadSeedCourseCovers = async (courseIds: readonly string[]): Promise<Map<string, string>> => {
  const uploads = await Promise.all(
    courseIds.map(async (id) => {
      const bytes = generatePortraitPng(id);
      const key = `courses/${id}/seed-cover.png`;
      await storage.put(key, bytes, 'image/png');
      return [id, key] as const;
    }),
  );
  return new Map(uploads);
};

// A timestamp landing at noon UTC on the given Israel calendar date: Israel
// is always ahead of UTC (+2 or +3), so noon UTC never crosses into the
// next or previous Israel day, which is all a manual-close fixture needs.
const noonOnIsraelDate = (isoDate: string): Date => new Date(`${isoDate}T12:00:00.000Z`);

interface CourseSeed {
  id: string;
  name: string;
  description: string;
  rabbiId?: string;
  teacherName?: string;
  addressName: string;
  addressStreet: string;
  cityName: string;
  openingDate: string;
  weeks: number;
  sessions: number;
  hours?: number;
  audience: 'men' | 'women' | 'mixed';
  joinableAfterOpening: boolean;
  contactPhone: string;
  priceShekels?: number;
  registrationClosedAt?: Date;
  closeReason?: 'closed' | 'full';
}

// One course per shape the plan asked this seed to cover: a rav's general
// course before opening, a joinable one already open, a rabbanit's women's
// course, an unlinked admin course with a typed address, one closed by
// hand, and one marked full. `rabbi-1`, `rabbi-3`, `rabbi-5` and `rabbi-6`
// (ravs) and `rabbi-9` (rabbanit) are seeded by `seedLessons`; this module
// depends on it having already run in the same transaction.
const buildCourseSeeds = (todayIso: string): CourseSeed[] => [
  {
    id: 'course-1',
    name: 'יסודות האמונה',
    description: 'קורס מובנה בן שמונה מפגשים ביסודות האמונה, למתחילים ולמתקדמים כאחד.',
    rabbiId: 'rabbi-1',
    addressName: 'בית הכנסת "אוהל יעקב"',
    addressStreet: 'רחוב הרב קוק 12',
    cityName: 'צפת',
    openingDate: addDays(todayIso, 21),
    weeks: 8,
    sessions: 8,
    hours: 12,
    audience: 'men',
    joinableAfterOpening: false,
    contactPhone: '0501234567',
    priceShekels: 450,
  },
  {
    id: 'course-2',
    name: 'עיון בהלכות שבת',
    description: 'קורס שבועי בעיון בהלכות שבת, אפשר להצטרף גם אחרי הפתיחה.',
    rabbiId: 'rabbi-3',
    addressName: 'ישיבת "מרכז הרב"',
    addressStreet: 'רחוב הרב קוק 9',
    cityName: 'ירושלים',
    openingDate: addDays(todayIso, -14),
    weeks: 20,
    sessions: 20,
    audience: 'mixed',
    joinableAfterOpening: true,
    contactPhone: '0502345678',
  },
  {
    id: 'course-3',
    name: 'מסע בספר תהילים',
    description: 'קורס לנשים בעיון בספר תהילים, פרק אחר פרק.',
    rabbiId: 'rabbi-9',
    addressName: 'מדרשה לנשים "בית יעל"',
    addressStreet: 'רחוב סוקולוב 14',
    cityName: 'רעננה',
    openingDate: addDays(todayIso, 10),
    weeks: 6,
    sessions: 6,
    audience: 'women',
    joinableAfterOpening: false,
    contactPhone: '0503456789',
    priceShekels: 300,
  },
  {
    id: 'course-4',
    name: 'סדנת גמרא לבעלי בתים',
    description: 'קורס עצמאי, ללא רב קבוע, בהנחיית מגידי שיעור מוזמנים.',
    teacherName: 'צוות מגידי שיעור',
    addressName: 'אולם אירועים "גני התורה"',
    addressStreet: 'רחוב ההסתדרות 2',
    cityName: 'אשדוד',
    openingDate: addDays(todayIso, 30),
    weeks: 10,
    sessions: 10,
    audience: 'mixed',
    joinableAfterOpening: false,
    contactPhone: '0504567890',
  },
  {
    id: 'course-5',
    name: 'עומק הפרשה',
    description: 'קורס בעיון בפרשת השבוע, ההרשמה נסגרה ביוזמת הרב.',
    rabbiId: 'rabbi-5',
    addressName: 'בית הכנסת "היכל שלמה"',
    addressStreet: 'שדרות רוטשילד 20',
    cityName: 'תל אביב - יפו',
    openingDate: addDays(todayIso, -30),
    // Joinable with weeks far outlasting the manual close below: the
    // calendar's own auto-close would only land 20 * 7 = 140 days after
    // opening, so the hand close on day -3 is genuinely what determines
    // `closedOn` here, not the calendar racing ahead of it.
    weeks: 20,
    sessions: 12,
    audience: 'men',
    joinableAfterOpening: true,
    contactPhone: '0505678901',
    registrationClosedAt: noonOnIsraelDate(addDays(todayIso, -3)),
    closeReason: 'closed',
  },
  {
    id: 'course-6',
    name: 'כולל ערב',
    description: 'קורס ערב קבוע, התמלא ונסגר להרשמה.',
    rabbiId: 'rabbi-6',
    addressName: 'כולל "בית מדרש עליון"',
    addressStreet: 'רחוב חזון איש 3',
    cityName: 'בני ברק',
    openingDate: addDays(todayIso, -60),
    weeks: 20,
    sessions: 24,
    audience: 'men',
    joinableAfterOpening: true,
    contactPhone: '0506789012',
    registrationClosedAt: noonOnIsraelDate(addDays(todayIso, -2)),
    closeReason: 'full',
  },
];

// Built through the same column writer a real create uses
// (`courseColumnsFrom`), never by hand: a seed course's venue is resolved
// exactly as a real write would resolve it. `executor: tx` because this
// runs inside the seed's own transaction, alongside `seedLessons`, which
// already depends on the rabbi rows this module also references.
const toCourseInsert = async (seed: CourseSeed, cityCodeByName: Map<string, number>, coverKeyByCourseId: Map<string, string>, tx: Tx) => {
  const cityCode = cityCodeByName.get(seed.cityName);
  if (cityCode === undefined) {
    throw new Error(`expected city '${seed.cityName}' to exist for course '${seed.id}', but it was not found`);
  }
  const coverKey = coverKeyByCourseId.get(seed.id);
  if (!coverKey) {
    throw new Error(`expected a seeded cover key for course '${seed.id}'`);
  }

  const columns = await courseColumnsFrom(
    {
      name: seed.name,
      description: seed.description,
      openingDate: seed.openingDate,
      weeks: seed.weeks,
      sessions: seed.sessions,
      hours: seed.hours,
      venue: { kind: 'address', name: seed.addressName, street: seed.addressStreet, cityCode },
      audience: seed.audience,
      joinableAfterOpening: seed.joinableAfterOpening,
      contactPhone: seed.contactPhone,
      priceShekels: seed.priceShekels,
    },
    { executor: tx },
  );

  return courseInsertSchema.parse({
    id: seed.id,
    rabbiId: seed.rabbiId ?? null,
    teacherName: seed.rabbiId ? null : seed.teacherName,
    coverKey,
    registrationClosedAt: seed.registrationClosedAt ?? null,
    closeReason: seed.closeReason ?? null,
    ...columns,
  });
};

export const seedCourses = async (
  tx: Tx,
  cityCodeByName: Map<string, number>,
  todayIso: string,
  coverKeyByCourseId: Map<string, string>,
): Promise<void> => {
  const seeds = buildCourseSeeds(todayIso);
  const rows = await Promise.all(seeds.map((seed) => toCourseInsert(seed, cityCodeByName, coverKeyByCourseId, tx)));

  await tx
    .insert(courses)
    .values(rows)
    .onConflictDoUpdate({
      target: courses.id,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        rabbiId: sql`excluded.rabbi_id`,
        teacherName: sql`excluded.teacher_name`,
        openingDate: sql`excluded.opening_date`,
        weeks: sql`excluded.weeks`,
        sessions: sql`excluded.sessions`,
        hours: sql`excluded.hours`,
        placeId: sql`excluded.place_id`,
        addressName: sql`excluded.address_name`,
        addressStreet: sql`excluded.address_street`,
        addressFloor: sql`excluded.address_floor`,
        cityCode: sql`excluded.city_code`,
        audience: sql`excluded.audience`,
        joinableAfterOpening: sql`excluded.joinable_after_opening`,
        contactPhone: sql`excluded.contact_phone`,
        priceShekels: sql`excluded.price_shekels`,
        coverKey: sql`excluded.cover_key`,
        registrationClosedAt: sql`excluded.registration_closed_at`,
        closeReason: sql`excluded.close_reason`,
      },
    });
};
