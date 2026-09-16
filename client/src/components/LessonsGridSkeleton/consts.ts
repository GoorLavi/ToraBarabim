// Stable keys for a fixed-length placeholder list with no real data to key by.
export const skeletonCardKeys = (cellCount: number): string[] =>
  Array.from({ length: cellCount }, (_, index) => `skeleton-card-${index}`);
