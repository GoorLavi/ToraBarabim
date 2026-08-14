import * as cheerio from 'cheerio';

import { SCHEDULE_HEADING_TEXT, SOURCE_URL } from './consts';

// Finds the weekly schedule image on the page. The image URL changes every
// week (a WhatsApp photo uploaded to WordPress with the upload date in its
// filename), so it must be read fresh from the page on every run rather
// than hardcoded. Locates it by walking from the heading that precedes it,
// not by picking "the first image on the page", since the page has other
// images.
export const locateScheduleImageUrl = (html: string): string => {
  const $ = cheerio.load(html);

  const heading = $('.elementor-heading-title')
    .filter((_, element) => $(element).text().includes(SCHEDULE_HEADING_TEXT))
    .first();
  if (heading.length === 0) {
    throw new Error(`ayal-taarog: could not find the "${SCHEDULE_HEADING_TEXT}" heading, the page layout may have changed`);
  }

  const headingWidget = heading.closest('.elementor-widget-heading');
  const imageWidget = headingWidget.nextAll('.elementor-widget-image').first();
  if (imageWidget.length === 0) {
    throw new Error('ayal-taarog: found the schedule heading but no image widget follows it');
  }

  const lightboxHref = imageWidget.find('a[data-elementor-open-lightbox]').first().attr('href');
  const imgSrc = imageWidget.find('img').first().attr('src');
  const imageUrl = lightboxHref ?? imgSrc;
  if (!imageUrl) {
    throw new Error('ayal-taarog: found the schedule image widget but it has no image URL');
  }

  return new URL(imageUrl, SOURCE_URL).toString();
};
