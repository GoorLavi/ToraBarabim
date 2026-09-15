export const BAND_TITLE = 'שיעורים לנשים';
export const BAND_LINK_LABEL = 'לכל השיעורים לנשים';
export const BAND_EMBLEM_SIZE = 80;

export const bandCountLine = (count: number): string =>
  count === 1 ? 'שיעור אחד בשבועיים הקרובים' : `${count} שיעורים בשבועיים הקרובים`;

export const INSET_ITEMS = [
  { key: 'day', label: 'לפי יום' },
  { key: 'city', label: 'לפי עיר' },
  { key: 'rabbi', label: 'לפי רב או רבנית' },
] as const;
