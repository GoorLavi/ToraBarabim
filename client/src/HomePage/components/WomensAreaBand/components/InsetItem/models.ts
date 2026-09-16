export type InsetItemIcon = 'day' | 'city' | 'rabbi';

export interface InsetItemProps {
  className?: string;
  icon: InsetItemIcon;
  label: string;
}
