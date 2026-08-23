import type { Area } from './area';

// The resolved venue attached to a public occurrence: the free-text fields
// as entered on the lesson, plus the city's name and area looked up from
// its code. There is no id: a venue is not an entity, just text on a lesson.
export interface Place {
  name: string;
  street: string;
  floor?: string;
  city: string;
  area: Area;
}
