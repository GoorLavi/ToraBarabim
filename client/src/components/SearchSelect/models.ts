import type { ReactNode } from 'react';

// The one control behind every "trigger a popover, search, pick a row"
// field in this app (`client/CLAUDE.md`, Component Tree): a searchable
// combobox generic over its item type `T`. A caller owns fetching, its own
// Hebrew copy and whatever sits beside the control; this component owns
// `isOpen`, the query, dismissal, and the three load states.
export interface SearchSelectProps<T> {
  className?: string;
  items: T[];
  isPending: boolean;
  isError: boolean;
  getItemKey: (item: T) => string;
  isSelected: (item: T) => boolean;
  onSelect: (item: T) => void;
  // The trigger button's own content: a label, or a chosen value plus a
  // status tag. `showChevron`, `truncateTrigger` and `emphasizeTrigger`
  // below are the chrome around that content a caller can still vary
  // without owning any CSS of its own.
  renderTrigger: () => ReactNode;
  renderOption: (item: T) => ReactNode;
  // This component owns the query as its own input state, but the caller's
  // own search hook is what turns it into `items`, so every keystroke is
  // relayed here, raw and undebounced; a hook that debounces does so on its
  // own side, same as before this component existed.
  onQueryChange: (query: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  // Shown instead of the load states while the query is empty. Omit it for
  // a caller whose search is already browsable before typing (its own items
  // and `isPending` already reflect that unfiltered list).
  hint?: string;
  loadingMessage: string;
  emptyMessage: string;
  errorMessage: string;
  // A caller's own sibling markup (a clear button, a summary line, a "not
  // listed" link) that shares this control's row or column and its gap,
  // without this component knowing what any of it is.
  children?: ReactNode;
  // Row for a compact pill beside its own sibling controls, column (the
  // default) for a field stacked in a form.
  rowLayout?: boolean;
  fullWidth?: boolean;
  invalid?: boolean;
  showChevron?: boolean;
  truncateTrigger?: boolean;
  emphasizeTrigger?: boolean;
  twoLineOptions?: boolean;
}
