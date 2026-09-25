import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import type { GalleryPhoto } from '~/components/GalleryField/models';

export interface CourseGalleryPhotosApi {
  uploadPhoto: (courseId: string, file: File) => Promise<CourseResponse>;
  deletePhoto: (courseId: string, photoId: string) => Promise<CourseResponse>;
  courseQueryKey: (courseId: string) => QueryKey;
}

type PendingStatus = 'draft' | 'uploading' | 'failed';

interface PendingPhoto {
  localId: string;
  file: File;
  objectUrl: string;
  status: PendingStatus;
}

export interface CourseGalleryPhotosState {
  photos: GalleryPhoto[];
  addFiles: (files: File[]) => void;
  retry: (localId: string) => void;
  remove: (id: string) => void;
  // Only meaningful before a course exists: uploads every still-local file
  // through the new id's own endpoint, one after another, and reports which
  // ones failed so the caller can hand them to the edit form's own retry UI
  // instead of losing them.
  uploadDraftsAfterCreate: (courseId: string) => Promise<File[]>;
}

// Shared by the rabbi and admin panels' own course forms (lifted here once
// the admin panel became a second, identical caller). `courseId` is
// undefined while creating: `addFiles` then only ever holds a file locally
// (no request fires), since there is no course id yet to upload it to. Once
// a real id exists, either because this is an edit from the start or
// because `uploadDraftsAfterCreate` just ran, every further `addFiles` call
// uploads immediately, the same as the cover's own `useCourseCoverUpload`.
// The two panels differ only in which endpoints upload and delete a photo
// and which query key the result belongs under, both passed in.
export const useCourseGalleryPhotos = (
  courseId: string | undefined,
  savedPhotos: { id: string; url: string }[],
  api: CourseGalleryPhotosApi,
  seedFailedFiles: File[] = [],
): CourseGalleryPhotosState => {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingPhoto[]>(() =>
    seedFailedFiles.map((file) => ({ localId: crypto.randomUUID(), file, objectUrl: URL.createObjectURL(file), status: 'failed' as const })),
  );
  const objectUrlsRef = useRef<Set<string>>(new Set(pending.map((photo) => photo.objectUrl)));

  useEffect(
    () => () => {
      for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => api.uploadPhoto(id, file),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => api.deletePhoto(courseId as string, photoId),
    onSuccess: (course) => queryClient.setQueryData(api.courseQueryKey(courseId as string), course),
  });

  const runUpload = (id: string, localId: string, file: File): Promise<boolean> =>
    new Promise((resolve) => {
      uploadMutation.mutate(
        { id, file },
        {
          onSuccess: (course) => {
            queryClient.setQueryData(api.courseQueryKey(id), course);
            setPending((prev) => {
              const item = prev.find((photo) => photo.localId === localId);
              if (item) {
                URL.revokeObjectURL(item.objectUrl);
                objectUrlsRef.current.delete(item.objectUrl);
              }
              return prev.filter((photo) => photo.localId !== localId);
            });
            resolve(true);
          },
          onError: () => {
            setPending((prev) => prev.map((photo) => (photo.localId === localId ? { ...photo, status: 'failed' } : photo)));
            resolve(false);
          },
        },
      );
    });

  const addFiles = (files: File[]): void => {
    for (const file of files) {
      const localId = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      setPending((prev) => [...prev, { localId, file, objectUrl, status: courseId ? 'uploading' : 'draft' }]);
      if (courseId) void runUpload(courseId, localId, file);
    }
  };

  const retry = (localId: string): void => {
    if (!courseId) return;
    const item = pending.find((photo) => photo.localId === localId);
    if (!item) return;
    setPending((prev) => prev.map((photo) => (photo.localId === localId ? { ...photo, status: 'uploading' } : photo)));
    void runUpload(courseId, localId, item.file);
  };

  const remove = (id: string): void => {
    const pendingItem = pending.find((photo) => photo.localId === id);
    if (pendingItem) {
      URL.revokeObjectURL(pendingItem.objectUrl);
      objectUrlsRef.current.delete(pendingItem.objectUrl);
      setPending((prev) => prev.filter((photo) => photo.localId !== id));
      return;
    }
    deleteMutation.mutate(id);
  };

  const uploadDraftsAfterCreate = async (newCourseId: string): Promise<File[]> => {
    const drafts = pending.filter((photo) => photo.status === 'draft');
    const failedFiles: File[] = [];
    for (const draft of drafts) {
      setPending((prev) => prev.map((photo) => (photo.localId === draft.localId ? { ...photo, status: 'uploading' } : photo)));
      // Awaited in sequence on purpose: the server has one upload endpoint
      // per file, so a course's photos land in the order they were added
      // only by finishing each request before starting the next.
      // eslint-disable-next-line no-await-in-loop
      const succeeded = await runUpload(newCourseId, draft.localId, draft.file);
      if (!succeeded) failedFiles.push(draft.file);
    }
    return failedFiles;
  };

  const photos: GalleryPhoto[] = [
    ...savedPhotos.map((photo) => ({ id: photo.id, url: photo.url, status: 'uploaded' as const })),
    ...pending.map((photo) => ({ id: photo.localId, url: photo.objectUrl, status: photo.status === 'draft' ? ('uploaded' as const) : photo.status })),
  ];

  return { photos, addFiles, retry, remove, uploadDraftsAfterCreate };
};
