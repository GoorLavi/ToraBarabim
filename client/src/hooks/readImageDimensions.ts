export interface ImageDimensions {
  width: number;
  height: number;
}

// The same decode-into-an-`<img>` technique `PhotoPicker.tsx`'s own
// `loadImageDimensions` keeps as its own copy: shared here, unlike that one,
// because both course photo hooks below need it for the same reason, in the
// same folder, which makes this their second real caller rather than a
// reach across an unrelated feature boundary.
export const readImageDimensions = (file: File): Promise<ImageDimensions> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`failed to read image dimensions for ${file.name}`));
    };
    image.src = objectUrl;
  });
