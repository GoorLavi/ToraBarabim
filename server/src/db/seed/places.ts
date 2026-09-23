import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

import { toSlug } from '../../service/shared/slug';
import type { Tx } from '../client';
import { places } from '../schema';

const placeInsertSchema = createInsertSchema(places);

interface PlaceSeed {
  id: string;
  name: string;
  street: string;
  floor?: string;
  cityName: string;
}

// A handful of registered venues, built through the same chokepoint an
// admin or a rabbi would use (`lessonVenueColumns`, via `resolveLesson` in
// `seed/lessons.ts`), never by hand: several of the seeded lessons below
// point at these by id instead of carrying their own address text.
export const PLACES: PlaceSeed[] = [
  { id: 'seed-place-1', name: 'ישיבת "נר דוד"', street: 'שדרות הנשיא 8', cityName: 'חיפה' },
  { id: 'seed-place-2', name: 'בית הכנסת "היכל שלמה"', street: 'שדרות רוטשילד 20', cityName: 'תל אביב - יפו' },
];

export const seedPlaces = async (tx: Tx, cityCodeByName: Map<string, number>): Promise<void> => {
  const rows = PLACES.map((place) => {
    const cityCode = cityCodeByName.get(place.cityName);
    if (cityCode === undefined) {
      throw new Error(`expected city '${place.cityName}' to exist for place '${place.id}', but it was not found`);
    }
    return placeInsertSchema.parse({
      id: place.id,
      slug: toSlug(place.name) || place.id,
      name: place.name,
      street: place.street,
      floor: place.floor ?? null,
      cityCode,
    });
  });

  await tx
    .insert(places)
    .values(rows)
    .onConflictDoUpdate({
      target: places.id,
      set: {
        slug: sql`excluded.slug`,
        name: sql`excluded.name`,
        street: sql`excluded.street`,
        floor: sql`excluded.floor`,
        cityCode: sql`excluded.city_code`,
      },
    });
};
