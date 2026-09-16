// `cellCount` is fixed for each instance and the list is never reordered or
// spliced, so no cell can change position under a mounted node.
export const skeletonCardKeys = (cellCount: number): string[] =>
  Array.from({ length: cellCount }, (_, index) => `skeleton-card-${index}`);
