import type { ImageMediaType } from '../../vision/models';

export const mediaTypeFromUrl = (url: string): ImageMediaType => {
  const extension = new URL(url).pathname.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      throw new Error(`ayal-taarog: schedule image URL has an unsupported extension: ${url}`);
  }
};
