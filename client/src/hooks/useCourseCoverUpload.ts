import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { courseErrorMessage, isCourseErrorCode } from '~/courseErrors';

export interface CourseCoverUploadApi {
  uploadCover: (courseId: string, file: File) => Promise<CourseResponse>;
  courseQueryKey: (courseId: string) => QueryKey;
  // Reads a thrown error's code and details without this shared hook
  // importing either panel's own error class by name.
  describeError: (error: unknown) => { code?: string; details?: unknown; status: number } | undefined;
}

export interface CourseCoverUploadState {
  previewUrl: string | undefined;
  status: 'uploading' | 'failed' | undefined;
  // The approved reason a rejected cover cannot be saved (spec section 13),
  // undefined for a plain network failure, which `PhotoPicker`'s own
  // generic failure line already covers.
  failureReason: string | undefined;
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

  const errorInfo = mutation.isError ? api.describeError(mutation.error) : undefined;
  const failureReason = errorInfo && isCourseErrorCode(errorInfo.code) ? courseErrorMessage(errorInfo.code, errorInfo.details) : undefined;

  return {
    previewUrl: mutation.isPending || mutation.isError ? objectUrl : undefined,
    status: mutation.isPending ? 'uploading' : mutation.isError ? 'failed' : undefined,
    failureReason,
    upload: (file: File) => {
      setSelectedFile(file);
      mutation.mutate(file);
    },
    retry: () => {
      if (selectedFile) mutation.mutate(selectedFile);
    },
  };
};
