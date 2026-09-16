import type { LessonProvenance } from '@torabarabim/common';

// When an admin or a rabbi edits a lesson by hand, an 'imported' lesson
// stops being fair game for the next import run: it becomes
// 'imported_edited', which the import treats as protected exactly like a
// hand-entered lesson (never overwritten), while still keeping its
// `importKey` so an identical row next week is recognised rather than
// duplicated. A 'manual' lesson, or one already 'imported_edited', is
// unaffected.
export const provenanceAfterHandEdit = (current: LessonProvenance): LessonProvenance =>
  current === 'manual' ? 'manual' : 'imported_edited';
