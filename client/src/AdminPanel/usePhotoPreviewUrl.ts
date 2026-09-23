import { useEffect, useState } from 'react';

// A local object URL for the plain preview described in this slice (no
// crop tool). Revoked on every change and on unmount so the browser does
// not accumulate blob URLs across repeated file picks. Lifted here from
// `RabbiFormPage/` once `PlaceFormPage` became a second caller
// (client/CLAUDE.md: a hook shared by two features lifts to the nearest
// folder both parents can see).
export const usePhotoPreviewUrl = (file: File | undefined): string | undefined => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return previewUrl;
};
