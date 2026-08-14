import type { Area } from '@torabarabim/common';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import type { Tx } from '../client';
import { cities } from '../schema';

const CITIES_RESOURCE_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=2000';

const POPULATION_RESOURCE_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=38207cf8-afe2-48ed-a3b0-c8f70c796015&limit=2000';

// סמל_נפה (sub-district code) to our own eight-value Area, hand-mapped from
// the 25 sub-districts in the data.gov.il yishuvim dataset (resource_id
// 5c78e9fa-c2e2-4771-93ff-7f400a12f7ba, fields סמל_נפה/שם_נפה): too granular
// for a filter meant to be tapped on a phone.
const NAFA_TO_AREA: Record<number, Area> = {
  11: 'jerusalem', // ירושלים
  21: 'north', // צפת
  22: 'north', // כנרת
  23: 'north', // עפולה
  24: 'north', // עכו
  25: 'north', // נצרת
  29: 'north', // גולן
  31: 'haifa', // חיפה
  32: 'haifa', // חדרה
  41: 'sharon', // השרון
  42: 'center', // פתח תקווה
  43: 'center', // רמלה
  44: 'shfela', // רחובות
  51: 'telAviv', // תל אביב
  52: 'telAviv', // רמת גן
  53: 'telAviv', // חולון
  61: 'south', // אשקלון
  62: 'south', // באר שבע
  71: 'north', // ג'נין
  72: 'sharon', // שכם
  73: 'sharon', // טול כרם
  74: 'jerusalem', // ראמאללה
  75: 'jerusalem', // ירדן )יריחו(
  76: 'jerusalem', // בית לחם
  77: 'jerusalem', // חברון
};

const rawCityRecordSchema = z.object({
  סמל_ישוב: z.string(),
  שם_ישוב: z.string(),
  שם_ישוב_לועזי: z.string().nullable(),
  סמל_נפה: z.number(),
});

const cityApiResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({ records: z.array(rawCityRecordSchema) }),
});

// The dataset's last two rows are blank padding, not localities: every
// field including LocalityCode is empty. Allow null here and skip them
// below, rather than rejecting the whole fetch over two non-rows.
const rawPopulationRecordSchema = z.object({
  LocalityCode: z.number().nullable(),
  Total_Population: z.string(),
});

const populationApiResponseSchema = z.object({
  success: z.literal(true),
  result: z.object({ records: z.array(rawPopulationRecordSchema) }),
});

const cityInsertSchema = createInsertSchema(cities);

type CityInsert = typeof cities.$inferInsert;

const fetchRawCityRecords = async (): Promise<z.infer<typeof rawCityRecordSchema>[]> => {
  const response = await fetch(CITIES_RESOURCE_URL);
  if (!response.ok) {
    throw new Error(`expected a 2xx response from the cities dataset, got ${response.status}`);
  }
  const body = cityApiResponseSchema.parse(await response.json());
  return body.result.records;
};

// '-' marks a figure the census does not have, in this field as in the
// others; treated as unknown population, not zero.
const parsePopulation = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '-' || trimmed === '') return null;

  const parsed = Number(trimmed.replace(/,/g, ''));
  if (!Number.isFinite(parsed)) {
    throw new Error(`expected a number or '-' for Total_Population, got '${value}'`);
  }
  return parsed;
};

// Joins on LocalityCode, the same official code as cities.code; the two
// datasets' Hebrew names are not used for matching. 1,222 rows against our
// 1,310 cities is expected: 88 localities have no census row.
const fetchPopulationByCode = async (): Promise<Map<number, number | null>> => {
  const response = await fetch(POPULATION_RESOURCE_URL);
  if (!response.ok) {
    throw new Error(`expected a 2xx response from the population dataset, got ${response.status}`);
  }
  const body = populationApiResponseSchema.parse(await response.json());

  const populationByCode = new Map<number, number | null>();
  for (const record of body.result.records) {
    if (record.LocalityCode === null) continue;
    populationByCode.set(record.LocalityCode, parsePopulation(record.Total_Population));
  }
  return populationByCode;
};

const toCityInsert = (
  record: z.infer<typeof rawCityRecordSchema>,
  populationByCode: Map<number, number | null>,
): CityInsert => {
  const code = Number(record.סמל_ישוב.trim());
  if (!Number.isFinite(code)) {
    throw new Error(`expected a numeric סמל_ישוב, got '${record.סמל_ישוב}'`);
  }

  const area = NAFA_TO_AREA[record.סמל_נפה];
  if (!area) {
    throw new Error(`expected a mapped area for סמל_נפה ${record.סמל_נפה}, on city code ${code}`);
  }

  // Four records have an empty Latin name; that is optional, not missing
  // data to reject.
  const nameEn = record.שם_ישוב_לועזי?.trim();

  return cityInsertSchema.parse({
    code,
    nameHe: record.שם_ישוב.trim(),
    nameEn: nameEn ? nameEn : null,
    area,
    population: populationByCode.get(code) ?? null,
  });
};

// Upserts every city keyed on its official code, so re-running the seed
// updates the 1,310 rows in place instead of duplicating them. Returns a
// name-to-code lookup for the rest of the seed to resolve places by city.
export const seedCities = async (tx: Tx): Promise<Map<string, number>> => {
  const [cityRecords, populationByCode] = await Promise.all([fetchRawCityRecords(), fetchPopulationByCode()]);
  const rows = cityRecords.map((record) => toCityInsert(record, populationByCode));

  await tx
    .insert(cities)
    .values(rows)
    .onConflictDoUpdate({
      target: cities.code,
      set: {
        nameHe: sql`excluded.name_he`,
        nameEn: sql`excluded.name_en`,
        area: sql`excluded.area`,
        population: sql`excluded.population`,
      },
    });

  return new Map(rows.map((row) => [row.nameHe, row.code] as const));
};
