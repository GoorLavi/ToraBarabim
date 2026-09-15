import type { ReactNode, RefObject } from 'react';

export interface DateFilterSheetProps {
  className?: string;
  heading: string;
  closeLabel: string;
  // The close button, and the scrim tap (`ResponsiveSheet`'s own dismiss),
  // are separate callbacks: closing through the button returns focus to the
  // trigger, closing through the scrim does not (see DateFilterChips.tsx,
  // `closePicker` versus `dismissPicker`).
  onClose: () => void;
  onDismiss: () => void;
  // Attached to the panel's own content wrapper (heading row and children
  // together), so the caller's Tab trap and outside-focus check can read
  // the whole sheet, not just the part it passed as `children`.
  contentRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}
