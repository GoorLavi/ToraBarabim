import type { ReactNode } from 'react';

// The one control behind every "trigger a popover, search, pick a row"
// field in this app: a searchable combobox generic over its item type `T`.
// It renders the trigger button and the popover; a caller owns fetching,
// the query state, its own Hebrew copy and whatever sits beside the
// control in its own markup.
export interface SearchSelectProps<T> {
  className?: string;
  items: T[];
  isPending: boolean;
  isError: boolean;
  getItemKey: (item: T) => string;
  isSelected: (item: T) => boolean;
  onSelect: (item: T) => void;
  // The trigger button's own content, and a result row's own content: a
  // label, or a chosen value plus a status tag; one line, or two. `.truncate`,
  // `.triggerPrimary`, `.optionPrimary` and `.optionSecondary` are the class
  // seam a caller reaches for inside either render prop's own markup.
  renderTrigger: () => ReactNode;
  renderOption: (item: T) => ReactNode;
  query: string;
  onQueryChange: (query: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  // Shown instead of the load states while the query is empty. Omit it for
  // a caller whose search is already browsable before typing (its own items
  // and `isPending` already reflect that unfiltered list).
  hint?: string;
  loadingMessage: string;
  emptyMessage: string;
  loadErrorMessage: string;
  fullWidth?: boolean;
  invalid?: boolean;
  // A second element inside the trigger, not chrome around its content:
  // only `CitySelect` shows one.
  showChevron?: boolean;
}
