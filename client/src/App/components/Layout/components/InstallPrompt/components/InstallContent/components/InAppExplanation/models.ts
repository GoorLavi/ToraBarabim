export interface InAppExplanationProps {
  className?: string;
  onCopyLink: () => Promise<void>;
  onClose: () => void;
}
