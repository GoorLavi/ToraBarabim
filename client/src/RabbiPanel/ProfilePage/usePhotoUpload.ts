import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadProfilePhoto } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export interface PhotoUploadState {
  // The local preview of the file currently uploading or that just failed
  // to upload; undefined once idle again, so the caller falls back to the
  // server's own `photoUrl`.
  previewUrl: string | undefined;
  status: 'uploading' | 'failed' | undefined;
  upload: (file: File) => void;
  retry: () => void;
}

// Uploads immediately on file selection, unlike the admin rabbi form
// (`RabbiFormPage/useSaveRabbi.ts`), which only uploads when the whole
// form is saved. Keeps the picked file around so a retry after a failure
// is one tap (rabbi-panel-copy.md, section 6).
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
      queryClient.setQueryData(RABBI_QUERY_KEYS.profile(), profile);
      setSelectedFile(undefined);
    },
  });

  return {
    previewUrl: mutation.isPending || mutation.isError ? objectUrl : undefined,
    status: mutation.isPending ? 'uploading' : mutation.isError ? 'failed' : undefined,
    upload: (file: File) => {
      setSelectedFile(file);
      mutation.mutate(file);
    },
    retry: () => {
      if (selectedFile) mutation.mutate(selectedFile);
    },
  };
};
