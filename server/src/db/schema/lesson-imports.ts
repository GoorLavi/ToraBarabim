import { sql } from 'drizzle-orm';
import { check, jsonb, pgTable, primaryKey, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { lessonImportLinkDecisionEnum, lessonImportLinkOriginEnum, lessonImportRuleKindEnum } from './enums';
import { rabbis } from './rabbis';

// Remembers which real rabbi a (cleaned name, source domain) pair resolves
// to, or that it is deliberately ignored (e.g. a radio broadcast credited
// to no rabbi in our directory). `nameKey` is the cleaned, lowercased form
// of the row's rabbiName; `source` is the source domain. One row per pair,
// so a later week's identical pair resolves without asking again.
export const lessonImportRabbiLinks = pgTable(
  'lesson_import_rabbi_links',
  {
    nameKey: text('name_key').notNull(),
    source: text('source').notNull(),
    rabbiId: text('rabbi_id').references(() => rabbis.id, { onDelete: 'cascade' }),
    decision: lessonImportLinkDecisionEnum('decision').notNull(),
    origin: lessonImportLinkOriginEnum('origin').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.nameKey, table.source] }),
    check(
      'lesson_import_rabbi_links_decision_shape',
      sql`(${table.decision} = 'linked' AND ${table.rabbiId} IS NOT NULL) OR (${table.decision} = 'ignored' AND ${table.rabbiId} IS NULL)`,
    ),
    check('lesson_import_rabbi_links_auto_only_linked', sql`${table.origin} = 'owner' OR ${table.decision} = 'linked'`),
  ],
);

// A learned rule the owner approved once: a city spelling to treat as a
// known city, a time-kind label to a canonical meaning, an audience label
// to `LessonAudience`, or a free-text topic to `LessonTopic`. `value`'s
// shape depends on `kind`, validated in `service/lesson-import/models.ts`
// (a Postgres CHECK cannot express a per-row JSON shape).
export const lessonImportRules = pgTable(
  'lesson_import_rules',
  {
    id: serial('id').primaryKey(),
    kind: lessonImportRuleKindEnum('kind').notNull(),
    matchText: text('match_text').notNull(),
    value: jsonb('value').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('lesson_import_rules_kind_match_text').on(table.kind, table.matchText)],
);

// A lesson the owner deleted by hand carries this key forever, so a future
// run whose source still reports it never recreates it. Written by the
// admin and rabbi delete paths whenever the deleted lesson had an
// `importKey` (see `service/shared/dismiss-import.ts`).
export const lessonImportDismissedKeys = pgTable('lesson_import_dismissed_keys', {
  importKey: text('import_key').primaryKey(),
  dismissedAt: timestamp('dismissed_at', { withTimezone: true }).notNull().defaultNow(),
});

// One row per applied import run, written only by `apply`. The trace that
// lets the weekly summary and any later question ("what did last week's run
// do?") be answered from the database instead of from memory.
export const lessonImportRuns = pgTable('lesson_import_runs', {
  id: serial('id').primaryKey(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
  week: text('week').notNull(),
  fileSha256: text('file_sha256').notNull(),
  counts: jsonb('counts').notNull(),
  deleted: jsonb('deleted').notNull(),
  withheld: jsonb('withheld').notNull(),
  newLinks: jsonb('new_links').notNull(),
});
