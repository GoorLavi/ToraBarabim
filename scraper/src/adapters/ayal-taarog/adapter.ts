import type { RawLesson, SourceAdapter } from '../models';
import type { Fetcher } from '../../fetch/models';
import { loadConfig } from '../../config';
import { todayInIsrael } from '../../date-utils';
import { readScheduleImage } from '../../vision/read-schedule-image';
import { SOURCE_URL } from './consts';
import { locateScheduleImageUrl } from './locate-image';
import { mapScheduleImageToRawLessons } from './map-schedule';
import { mediaTypeFromUrl } from './media-type';

export const ayalTaarogAdapter: SourceAdapter = {
  id: 'ayal-taarog',
  name: 'Ayal Taarog (ayal-taarog.org.il)',

  async collect(fetcher: Fetcher): Promise<RawLesson[]> {
    // The API key is not passed through the SourceAdapter interface, which
    // every other adapter's collect() also does not need; loading config
    // here follows the same pattern as db/cities.ts, the other place that
    // reads a piece of config an adapter needs but collect() is not given.
    const { anthropicApiKey } = loadConfig(process.env);
    if (!anthropicApiKey) {
      throw new Error('ayal-taarog: ANTHROPIC_API_KEY is not set, cannot read the schedule image');
    }

    const html = await fetcher.fetchText(SOURCE_URL);
    const imageUrl = locateScheduleImageUrl(html);
    const imageBuffer = await fetcher.fetchBuffer(imageUrl);

    const schedule = await readScheduleImage(imageBuffer, mediaTypeFromUrl(imageUrl), anthropicApiKey);

    return mapScheduleImageToRawLessons(schedule, todayInIsrael(new Date()));
  },
};
