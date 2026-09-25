import { COURSE_GALLERY_PHOTO_MIN_SIDE } from '~/consts';

// The same decode-into-an-`<img>` technique `PhotoPicker.tsx`'s own
// `loadImageDimensions` uses for its own, separate check: no shared home
// for either copy (this component and that one do not import from each
// other), so this is a small, independent duplicate rather than a reach
// across that boundary.
const imageShorterSide = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.min(image.naturalWidth, image.naturalHeight));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`failed to read image dimensions for ${file.name}`));
    };
    image.src = objectUrl;
  });

// A file that cannot be decoded as an image is handed through rather than
// rejected here: the upload request itself will reject it with its own
// `unsupported_file_type`, which already has the approved Hebrew for that
// case (`~/courseErrors.ts`).
export const clearsGalleryFloor = (file: File): Promise<boolean> =>
  imageShorterSide(file).then(
    (shorterSide) => shorterSide >= COURSE_GALLERY_PHOTO_MIN_SIDE,
    () => true,
  );
