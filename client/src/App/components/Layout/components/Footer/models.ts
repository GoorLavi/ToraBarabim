import type { InstallFooterLink } from '../InstallPrompt/models';

export interface FooterProps {
  className?: string;
  // Rendered only when present: the install link exists after mount and only
  // where there is something to install.
  installLink?: InstallFooterLink | null;
}
