import type { DedicationGroup } from '@torabarabim/common';
import type { MouseEvent, PointerEvent } from 'react';

import type { DedicationVariant } from '~/components/DedicationUnit/models';

export interface PressHandlers {
  // Drives the band's own cursor, switching to "grabbing" once a drag
  // clears the press threshold (styles.ts).
  isDraggingPastThreshold: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

export interface DedicationBandProps {
  className?: string;
  // Absent or empty renders nothing at all: each band is fixed to one
  // `DedicationType`, and a type with no active dedications is not shown.
  group: DedicationGroup | undefined;
  variant: DedicationVariant;
}

export interface DedicationBandTrackProps {
  className?: string;
  group: DedicationGroup;
  variant: DedicationVariant;
}
