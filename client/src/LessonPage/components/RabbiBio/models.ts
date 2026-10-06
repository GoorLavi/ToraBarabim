import type { Rabbi } from '@torabarabim/common';

export interface RabbiBioProps {
  className?: string;
  // Whoever teaches this occurrence (the substitute, when there is one).
  teachingRabbi: Rabbi;
}
