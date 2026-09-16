import { db, type Tx } from '../../db/client';
import { lessonImportDismissedKeys } from '../../db/schema';

// A lesson the owner deleted by hand must never come back on the next
// import run just because its source still reports it. Called from inside
// the same transaction as the delete itself by `admin-lesson.remove` and
// `rabbi-lesson.remove`, whenever the deleted lesson carried an
// `importKey`. A no-op for a 'manual' lesson, which never has one.
export const dismissImportKey = async (importKey: string | null, executor: Tx | typeof db = db): Promise<void> => {
  if (!importKey) return;
  await executor.insert(lessonImportDismissedKeys).values({ importKey }).onConflictDoNothing();
};
