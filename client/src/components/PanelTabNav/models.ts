export interface PanelTabNavItem {
  to: string;
  label: string;
  onClick?: () => void;
}

export interface PanelTabNavProps {
  className?: string;
  ariaLabel: string;
  items: PanelTabNavItem[];
}
