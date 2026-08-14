import { nextScheduledRun } from './next-run';

// Runs `task` every Sunday at 16:00 Israel time, forever, by recomputing
// the next occurrence after each run rather than a fixed 7-day interval,
// so a DST change never drifts the schedule by an hour.
//
// Honest limitation: there is no deployment for this yet. This only fires
// while whatever machine started it happens to be awake and this process
// happens to still be running; it is not a substitute for a real cron job
// or scheduled task once the scraper is deployed somewhere that stays up.
export const startWeeklySchedule = (task: () => Promise<void>): void => {
  const scheduleNext = (): void => {
    const runAt = nextScheduledRun(new Date());
    const delayMs = runAt.getTime() - Date.now();
    // eslint-disable-next-line no-console -- this is a CLI process, not a request handler with a logger
    console.log(`Next scheduled run at ${runAt.toISOString()}`);

    setTimeout(() => {
      task()
        .catch((error: unknown) => {
          // eslint-disable-next-line no-console -- see above
          console.error('Scheduled run failed', error);
        })
        .finally(scheduleNext);
    }, delayMs);
  };

  scheduleNext();
};
