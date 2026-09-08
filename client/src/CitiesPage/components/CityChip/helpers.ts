// Drawn twice in the frames as a singular (design spec, "Count copy"), and
// not optional.
export const cityLessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);
