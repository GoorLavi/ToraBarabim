import type { DedicationHonorific, DedicationType, HonoredGender } from '@torabarabim/common';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

import { addDays } from '../../service/lesson/israel-time';
import type { Tx } from '../client';
import { dedications } from '../schema';

const dedicationInsertSchema = createInsertSchema(dedications);

interface DedicationSeed {
  id: string;
  type: DedicationType;
  honoredName: string;
  honorific?: DedicationHonorific;
  // Absent for a whole-family dedication, which has no parentName either and
  // therefore no gender to give (`requireGenderWhenParentNamePresent`,
  // `service/admin-dedication/models.ts`).
  honoredGender?: HonoredGender;
  parentName?: string;
  donorFamilyName?: string;
  closingLineEnabled: boolean;
  // Both relative to the day the seed runs, so a re-run on a different day
  // still produces a live, an upcoming, an expired and a taken-down row.
  startsOffsetDays: number;
  endsOffsetDays: number;
  takenDownReason?: string;
}

// Five live memorial rows so this group alone overflows the 1280 viewport
// the band crawls in (4 units at 280 wide with a 64 gap already clears it;
// five leaves margin). `dedication-1`'s name is the plan's own wrap
// example: "חנה דבורה ע״ה" is 290 wide against a 280 unit and wraps as a
// matter of course.
const DEDICATIONS: DedicationSeed[] = [
  {
    id: 'dedication-1',
    type: 'memorial',
    honoredName: 'חנה דבורה',
    honorific: 'ah',
    honoredGender: 'female',
    parentName: 'משה',
    closingLineEnabled: true,
    startsOffsetDays: -10,
    endsOffsetDays: 20,
  },
  {
    id: 'dedication-2',
    type: 'memorial',
    honoredName: 'יוסף לוי',
    honorific: 'zl',
    honoredGender: 'male',
    parentName: 'אברהם',
    donorFamilyName: 'לוי',
    closingLineEnabled: false,
    startsOffsetDays: -3,
    endsOffsetDays: 30,
  },
  {
    id: 'dedication-3',
    type: 'memorial',
    honoredName: 'רבקה ישראלי',
    honorific: 'ah',
    honoredGender: 'female',
    closingLineEnabled: true,
    // `endsOn` lands on today itself, exercising the inclusive boundary in
    // `listActive`.
    startsOffsetDays: -1,
    endsOffsetDays: 0,
  },
  {
    id: 'dedication-4',
    type: 'memorial',
    honoredName: 'אליהו חיים',
    honorific: 'hyd',
    honoredGender: 'male',
    parentName: 'חיים',
    closingLineEnabled: false,
    startsOffsetDays: -20,
    endsOffsetDays: 5,
  },
  {
    id: 'dedication-5',
    type: 'memorial',
    honoredName: 'שרה כהן',
    honorific: 'ah',
    honoredGender: 'female',
    parentName: 'יעקב',
    closingLineEnabled: false,
    startsOffsetDays: -7,
    endsOffsetDays: 14,
  },
  {
    id: 'dedication-6',
    type: 'healing',
    honoredName: 'משה כהן',
    honoredGender: 'male',
    parentName: 'רחל',
    closingLineEnabled: false,
    startsOffsetDays: -2,
    endsOffsetDays: 10,
  },
  {
    id: 'dedication-7',
    type: 'healing',
    honoredName: 'לאה מזרחי',
    honoredGender: 'female',
    parentName: 'מרים',
    donorFamilyName: 'אזולאי',
    closingLineEnabled: false,
    startsOffsetDays: -5,
    endsOffsetDays: 25,
  },
  {
    id: 'dedication-8',
    type: 'success',
    honoredName: 'דוד אביטן',
    honoredGender: 'male',
    parentName: 'שלמה',
    donorFamilyName: 'מזרחי',
    closingLineEnabled: false,
    startsOffsetDays: -4,
    endsOffsetDays: 15,
  },
  // A whole-family dedication: no gender and no parentName, which the
  // composer handles by simply omitting the parent line.
  {
    id: 'dedication-9',
    type: 'success',
    honoredName: 'משפחת אשכנזי',
    closingLineEnabled: false,
    startsOffsetDays: -1,
    endsOffsetDays: 12,
  },
  // Not yet started: `startsOn` is in the future.
  {
    id: 'dedication-10',
    type: 'memorial',
    honoredName: 'יעקב פרידמן',
    honorific: 'zl',
    honoredGender: 'male',
    closingLineEnabled: false,
    startsOffsetDays: 5,
    endsOffsetDays: 20,
  },
  // Expired: `endsOn` is in the past.
  {
    id: 'dedication-11',
    type: 'healing',
    honoredName: 'אסתר גבאי',
    honoredGender: 'female',
    closingLineEnabled: false,
    startsOffsetDays: -60,
    endsOffsetDays: -30,
  },
  // Taken down: inside its own window, but must never serve, per
  // `listActive`'s fail-closed rule.
  {
    id: 'dedication-12',
    type: 'success',
    honoredName: 'רפאל אדרי',
    honoredGender: 'male',
    closingLineEnabled: false,
    startsOffsetDays: -10,
    endsOffsetDays: 20,
    takenDownReason: 'הוסר לבקשת המשפחה',
  },
];

const toDedicationInsert = (seed: DedicationSeed, todayIso: string): typeof dedications.$inferInsert =>
  dedicationInsertSchema.parse({
    id: seed.id,
    type: seed.type,
    honoredName: seed.honoredName,
    honorific: seed.honorific ?? null,
    honoredGender: seed.honoredGender ?? null,
    parentName: seed.parentName ?? null,
    donorFamilyName: seed.donorFamilyName ?? null,
    closingLineEnabled: seed.closingLineEnabled,
    startsOn: addDays(todayIso, seed.startsOffsetDays),
    endsOn: addDays(todayIso, seed.endsOffsetDays),
    takenDownReason: seed.takenDownReason ?? null,
    takenDownAt: seed.takenDownReason ? new Date() : null,
  });

export const seedDedications = async (tx: Tx, todayIso: string): Promise<void> => {
  await tx
    .insert(dedications)
    .values(DEDICATIONS.map((seed) => toDedicationInsert(seed, todayIso)))
    .onConflictDoUpdate({
      target: dedications.id,
      set: {
        type: sql`excluded.type`,
        honoredName: sql`excluded.honored_name`,
        honorific: sql`excluded.honorific`,
        honoredGender: sql`excluded.honored_gender`,
        parentName: sql`excluded.parent_name`,
        donorFamilyName: sql`excluded.donor_family_name`,
        closingLineEnabled: sql`excluded.closing_line_enabled`,
        startsOn: sql`excluded.starts_on`,
        endsOn: sql`excluded.ends_on`,
        takenDownReason: sql`excluded.taken_down_reason`,
        takenDownAt: sql`excluded.taken_down_at`,
      },
    });
};
