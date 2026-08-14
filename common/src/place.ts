import type { Area } from './area';

export interface Place {
  id: string;
  name: string;
  address: string;
  city: string;
  area: Area;
}
