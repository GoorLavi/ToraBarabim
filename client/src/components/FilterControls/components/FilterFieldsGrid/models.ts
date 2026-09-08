import type { FilterControlsProps } from '../../models';

// Same shape as the header's own props: this grid is the header's content,
// rendered once in normal flow and again inside `PinnedHeaderBar`'s expand
// panel, since that panel is meant to read as the same header shown again.
export type FilterFieldsGridProps = FilterControlsProps;
