import { ADAPTERS } from './adapters';
import { loadConfig } from './config';
import { fetchCities } from './db/cities';
import { buildSummary } from './output/summary';
import { writeRunReport } from './output/write';
import { runAll } from './run/run';
import { startWeeklySchedule } from './schedule/schedule';

interface Cli {
  adapterId?: string;
  schedule: boolean;
}

const parseArgs = (argv: string[]): Cli => {
  const adapterIndex = argv.indexOf('--adapter');
  return {
    adapterId: adapterIndex === -1 ? undefined : argv[adapterIndex + 1],
    schedule: argv.includes('--schedule'),
  };
};

const selectAdapters = (adapterId: string | undefined) => {
  if (!adapterId) return ADAPTERS;

  const adapter = ADAPTERS.find((candidate) => candidate.id === adapterId);
  if (!adapter) {
    throw new Error(`No adapter registered with id '${adapterId}'. Known ids: ${ADAPTERS.map((a) => a.id).join(', ') || '(none)'}`);
  }
  return [adapter];
};

const runOnce = async (adapterId: string | undefined): Promise<void> => {
  const config = loadConfig(process.env);
  const adapters = selectAdapters(adapterId);
  const cities = await fetchCities();

  const report = await runAll(adapters, config, cities);
  const filePath = await writeRunReport(config.outputDir, report);

  console.log(buildSummary(report));
  console.log(`Full report written to ${filePath}`);
};

const main = async (): Promise<void> => {
  const cli = parseArgs(process.argv.slice(2));

  if (cli.schedule) {
    startWeeklySchedule(() => runOnce(cli.adapterId));
    return;
  }

  await runOnce(cli.adapterId);
};

main().catch((error: unknown) => {
  console.error('Scraper run failed to start', error);
  process.exitCode = 1;
});
