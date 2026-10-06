import { nanoid } from 'nanoid';

import { db, type Tx } from '../../db/client';
import { places } from '../../db/schema';
import { toSlug } from './slug';

export interface PlaceInsertInput {
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
}

// The one producer of `places` rows. Callers verify their own references
// (the city) first. Inserts in one batch and returns the new ids in input
// order, so a caller that writes several places and the lessons pointing at
// them can do it inside one transaction by passing its `tx`.
export const insertPlaces = async (inputs: PlaceInsertInput[], executor: Tx | typeof db = db): Promise<string[]> => {
  if (inputs.length === 0) return [];
  const rows = inputs.map((input) => {
    const id = nanoid();
    return { id, slug: toSlug(input.name) || id, name: input.name, street: input.street, floor: input.floor ?? null, cityCode: input.cityCode };
  });
  await executor.insert(places).values(rows);
  return rows.map((row) => row.id);
};
