import type { DedicationText } from '@torabarabim/common';

// Names the field the unit sits on, matching `StateCardProps.variant`'s
// shape: 'onPrimary' for the foot band's plum field, 'onPage' for the
// between-rails placement on the page field.
export type DedicationVariant = 'onPrimary' | 'onPage';

export interface DedicationUnitProps {
  className?: string;
  text: DedicationText;
  variant: DedicationVariant;
}

export interface OrnamentProps {
  className?: string;
  // Renders the same artwork flipped with `transform: scaleY(-1)`
  // (design-system.md, dedication geometry), never a second path.
  mirrored?: boolean;
}

// Colour-only: every key here becomes exactly one `--dedication-*` custom
// property. `styles.ts`'s variant blocks assign nothing else, so adding a
// layout key (`paddingBlock`, `gap`, ...) here is the only way to make a
// variant change geometry, and TypeScript's excess-property check on the
// `VARIANT_TOKENS` object literal in `consts.ts` rejects it.
export interface DedicationVariantTokens {
  // The formula, name and parent lines.
  text: string;
  // The closing line, the one that steps back.
  closingText: string;
  shadow: string;
  // The ornament's gradient, three stops at 0, 0.4 and 1. A custom property
  // can change a stop's colour but never remove a stop, which is why both
  // ramps declare all three (design-system.md, dedication ornament gradient).
  ornamentStop0: string;
  ornamentStop40: string;
  ornamentStop100: string;
}
