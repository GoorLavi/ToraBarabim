import { readFile } from 'node:fs/promises';

import type {
  AgentImportApplyResult,
  AgentImportCreatedPlace,
  AgentImportNewPlace,
  AgentImportWithheldDeletion,
  AgentImportDecisionRequest,
  AgentImportDecisionResponse,
  AgentImportPlanResponse,
  AgentImportRabbiSearchResult,
  LessonImportFile,
} from '@torabarabim/common';

import { loadConfig } from './config';
import { EXIT_NEEDS_ATTENTION, IMPORTS_DIR } from './consts';
import { getJson, postJson } from './http';
import { isoWeekOf } from './israel-week';

const printJson = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};

const dayOfSummary = (summary: { weekday?: number; date?: string }): string => summary.date ?? `weekday ${summary.weekday ?? '?'}`;

// The proof the owner reads before approving a duplicate's deletion: the
// twin beside the lesson it duplicates, both ids and both place texts. On
// stderr so the JSON on stdout stays machine-readable.
const printDuplicatePairs = (withheld: AgentImportWithheldDeletion[]): void => {
  for (const item of withheld) {
    if (item.reason !== 'duplicate') continue;
    const kept = item.keptLesson;
    process.stderr.write(
      `duplicate: ${item.rabbiName}, ${dayOfSummary(item)} ${item.startTime}: lesson ${item.lessonId} at "${item.place}" duplicates lesson ${kept.lessonId} at "${kept.place}" (${kept.provenance}). Approve with --ack-lesson ${item.lessonId}\n`,
    );
  }
};

const printNewPlaces = (newPlaces: (AgentImportNewPlace | AgentImportCreatedPlace)[]): void => {
  for (const place of newPlaces) process.stderr.write(`new place: "${place.name}", ${place.street}, city code ${place.cityCode}\n`);
};

const readFileArg = (args: string[], usage: string): string => {
  const path = args[0];
  if (!path) throw new Error(usage);
  return path;
};

const readLessonImportFile = async (path: string): Promise<LessonImportFile> => JSON.parse(await readFile(path, 'utf8')) as LessonImportFile;

const run = async (): Promise<void> => {
  const [, , command, ...args] = process.argv;

  if (command === 'week-file') {
    // No server call and no config needed: this just names the path the
    // collector should write to, computed from Israel's current ISO week.
    printJson({ path: `${IMPORTS_DIR}/lessons-${isoWeekOf(new Date())}.json` });
    return;
  }

  const config = loadConfig(process.env);

  if (command === 'plan') {
    const file = await readLessonImportFile(readFileArg(args, 'usage: importer plan <file>'));
    const result = await postJson<AgentImportPlanResponse>(config, '/v1/agent/imports/plan', file);
    printJson(result);
    printDuplicatePairs(result.withheldIfUnacked);
    printNewPlaces(result.newPlaces);
    process.exitCode = result.questions.length > 0 || result.withheldIfUnacked.length > 0 ? EXIT_NEEDS_ATTENTION : 0;
    return;
  }

  if (command === 'rabbis') {
    const qIndex = args.indexOf('--q');
    const q = qIndex >= 0 ? args[qIndex + 1] : undefined;
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    const result = await getJson<AgentImportRabbiSearchResult>(config, `/v1/agent/imports/rabbis${query}`);
    printJson(result);
    return;
  }

  if (command === 'decide') {
    const raw = readFileArg(args, 'usage: importer decide <json>');
    const decision = JSON.parse(raw) as AgentImportDecisionRequest;
    const result = await postJson<AgentImportDecisionResponse>(config, '/v1/agent/imports/decisions', decision);
    printJson(result);
    return;
  }

  if (command === 'apply') {
    const applyUsage = 'usage: importer apply <file> --digest <digest> [--ack <domain>]... [--ack-lesson <lesson id>]...';
    const filePath = readFileArg(args, applyUsage);
    const digestIndex = args.indexOf('--digest');
    const digest = digestIndex >= 0 ? args[digestIndex + 1] : undefined;
    if (!digest) throw new Error(applyUsage);

    const acks: string[] = [];
    const ackLessonIds: string[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === '--ack' && args[i + 1]) acks.push(args[i + 1] as string);
      if (args[i] === '--ack-lesson' && args[i + 1]) ackLessonIds.push(args[i + 1] as string);
    }

    const file = await readLessonImportFile(filePath);
    const result = await postJson<AgentImportApplyResult>(config, '/v1/agent/imports/apply', { file, digest, acks, ackLessonIds });
    printJson(result);
    printDuplicatePairs(result.withheld);
    printNewPlaces(result.newPlaces);
    process.exitCode = result.withheld.length > 0 ? EXIT_NEEDS_ATTENTION : 0;
    return;
  }

  throw new Error(`unknown command '${command ?? ''}'; expected one of: week-file, plan, rabbis, decide, apply`);
};

run().catch((error: unknown) => {
  // Never the key: `loadConfig` and `http.ts` never put it in an Error
  // message, so printing `error.message` here stays safe even on failure.
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
