import type { VisitorMessageType } from '@torabarabim/common';

export interface MessageTileProps {
  kind: VisitorMessageType;
  // Hands back the element that was pressed, so the window can return focus
  // to it on close (HomeRails owns the window, not the tile).
  onPress: (opener: HTMLElement) => void;
}
