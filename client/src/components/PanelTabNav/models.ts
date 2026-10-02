export interface PanelTabNavItem {
  to: string;
  label: string;
  onClick?: () => void;
}

export interface PanelTabNavProps {
  className?: string;
  ariaLabel: string;
  items: PanelTabNavItem[];
  // The column count below `theme.layout.panelTabFourColumnWidth`, for a
  // strip whose tabs do not fit that many to a row on the narrowest phones.
  // Absent, the count stays what the item count gives at every phone width.
  narrowColumns?: number;
}
