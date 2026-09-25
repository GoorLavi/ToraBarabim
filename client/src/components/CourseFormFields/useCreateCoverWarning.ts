import { useEffect, useState } from 'react';

import { readImageDimensions } from '~/hooks/readImageDimensions';
import { COURSE_COVER_SOFT_MIN_HEIGHT, COURSE_COVER_SOFT_MIN_WIDTH, COURSE_PHOTO_SMALL_WARNING } from '~/consts';

// The create form's own cover (`CourseFormState.cover`) has no upload of its
// own to warn "after": it only uploads once the whole course is saved. This
// warns the moment it is picked instead, the same soft floor and the same
// line as the edit form's own `useCourseCoverUpload`.
export const useCreateCoverWarning = (cover: File | undefined): string | undefined => {
  const [warning, setWarning] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!cover) {
      setWarning(undefined);
      return;
    }
    let cancelled = false;
    setWarning(undefined);
    void readImageDimensions(cover).then(
      ({ width, height }) => {
        if (!cancelled) setWarning(width < COURSE_COVER_SOFT_MIN_WIDTH || height < COURSE_COVER_SOFT_MIN_HEIGHT ? COURSE_PHOTO_SMALL_WARNING : undefined);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [cover]);

  return warning;
};
