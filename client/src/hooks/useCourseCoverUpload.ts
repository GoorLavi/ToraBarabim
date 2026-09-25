import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

export interface CourseCoverUploadApi {
  uploadCover: (courseId: string, file: File) => Promise<CourseResponse>;
  courseQueryKey: (courseId: string) => QueryKey;
}

export interface CourseCoverUploadState {
  previewUrl: string | undefined;
  status: 'uploading' | 'failed' | undefined;
  upload: (file: File) => void;
  retry: () => void;
}

// Shared by the rabbi and admin panels' own course forms (lifted here once
// the admin panel became a second, identical caller): only ever used on an
// existing course, uploading immediately on file selection so a retry after
// a failure is one tap, never bundled into either panel's own save
// mutation. The two panels differ only in which endpoint uploads the file
// and which query key the result belongs under, both passed in.
export const useCourseCoverUpload = (courseId: string, api: CourseCoverUploadApi): CourseCoverUploadState => {
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
    mutationFn: (file: File) => api.uploadCover(courseId, file),
    onSuccess: (course) => {
      queryClient.setQueryData(api.courseQueryKey(courseId), course);
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
