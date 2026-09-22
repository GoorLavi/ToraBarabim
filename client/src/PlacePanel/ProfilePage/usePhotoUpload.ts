import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { PlaceApiError, uploadProfilePhoto } from '~/PlacePanel/api';
import { PLACE_QUERY_KEYS } from '~/PlacePanel/consts';

export interface PhotoUploadState {
  // The local preview of the file currently uploading or that just failed to
  // upload; undefined once idle again, so the caller falls back to the
  // server's own `photoUrl`. Mirrors `RabbiPanel/ProfilePage/usePhotoUpload.ts`.
  previewUrl: string | undefined;
  status: 'uploading' | 'failed' | undefined;
  // The server's own rejection, surfaced separately from `PhotoPicker`'s
  // generic failed-state copy: nothing about this photo is normalised
  // server-side, so its specific reason (wrong ratio, too small, ...)
  // matters more here than on the rabbi's fixed-ratio poster (build brief).
  error: PlaceApiError | undefined;
  upload: (file: File) => void;
  retry: () => void;
}

export const usePhotoUpload = (): PhotoUploadState => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [objectUrl, setObjectUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedFile) {
      setObjectUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: (profile) => {
      queryClient.setQueryData(PLACE_QUERY_KEYS.profile(), profile);
      setSelectedFile(undefined);
      trackEvent(MIXPANEL_EVENTS.profilePhotoUploaded);
    },
  });

  return {
    previewUrl: mutation.isPending || mutation.isError ? objectUrl : undefined,
    status: mutation.isPending ? 'uploading' : mutation.isError ? 'failed' : undefined,
    error: mutation.error instanceof PlaceApiError ? mutation.error : undefined,
    upload: (file: File) => {
      setSelectedFile(file);
      mutation.mutate(file);
    },
    retry: () => {
      if (selectedFile) mutation.mutate(selectedFile);
    },
  };
};
