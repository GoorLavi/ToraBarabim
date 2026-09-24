import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadCourseCover } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

export interface CourseCoverUploadState {
  previewUrl: string | undefined;
  status: 'uploading' | 'failed' | undefined;
  upload: (file: File) => void;
  retry: () => void;
}

// Only ever used on an existing course: uploads immediately on file
// selection, the same as `ProfilePage/usePhotoUpload.ts`'s own cover for
// the same reason (a retry after a failure is one tap), never bundled into
// `useSaveCourse.ts`'s own PATCH.
export const useCourseCoverUpload = (courseId: string): CourseCoverUploadState => {
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
    mutationFn: (file: File) => uploadCourseCover(courseId, file),
    onSuccess: (course) => {
      queryClient.setQueryData(RABBI_QUERY_KEYS.course(courseId), course);
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
