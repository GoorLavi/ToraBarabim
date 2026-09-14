import type { Area } from './area';

export interface City {
  id: string;
  name: string;
  slug: string;
  area: Area;
}
