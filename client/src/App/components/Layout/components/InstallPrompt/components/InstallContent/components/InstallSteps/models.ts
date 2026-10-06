import type { InstructionsContent } from '../../models';

export interface InstallStepsProps {
  className?: string;
  content: InstructionsContent;
  onClose: () => void;
}
