import type { City } from '@torabarabim/common';

interface CityChipBaseProps {
  className?: string;
  city: City;
  lessonCount?: number;
}

// The cities and area grids navigate to the city page; /women has no city
// page of its own to navigate to, so it selects the city in place instead
// (plan, section 5: "CityChip (from summary.cities, tapping selects in
// place)"). Never both on the same call.
export type CityChipProps = CityChipBaseProps & ({ onSelect?: undefined } | { onSelect: () => void; selected: boolean });
