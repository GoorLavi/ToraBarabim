import type { InstallDevice, InstallFlow } from '../../models';
import type { InstallIconName } from '../InstallIcon/models';

export interface InstallContentProps {
  step: Extract<InstallFlow, { status: 'open' }>['step'];
  device: InstallDevice;
  onAccept: () => void;
  onDismiss: () => void;
  onCopyLink: () => Promise<void>;
}

// A sentence may carry the share icon inline: the iOS step that points at a
// share button in the top bar draws it in the text, since that button is not
// where the step's own tile would suggest.
export type InstructionText = ReadonlyArray<string | { icon: InstallIconName }>;

export type StepTile = { icon: InstallIconName } | { label: string };

export interface InstallStep {
  id: string;
  text: InstructionText;
  subText?: string;
  tile?: StepTile;
}

export interface InstructionsContent {
  headline: string;
  steps: readonly InstallStep[];
  hasHomeScreenPreview: boolean;
  note?: string;
  closeLabel: string;
}
