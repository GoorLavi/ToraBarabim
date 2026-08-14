import type { Area } from '@torabarabim/common';
import { z } from 'zod';

export const citySearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;

export interface ResolvedCity {
  code: number;
  nameHe: string;
  area: Area;
}
