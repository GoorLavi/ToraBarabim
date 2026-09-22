import type { Area } from './area';

// The resolved address attached to a public occurrence: the free-text
// fields as entered on the lesson (or its exception override), plus the
// city's name and area looked up from its code.
export interface ResolvedAddress {
  name: string;
  street: string;
  floor?: string;
  city: string;
  citySlug: string;
  area: Area;
}
