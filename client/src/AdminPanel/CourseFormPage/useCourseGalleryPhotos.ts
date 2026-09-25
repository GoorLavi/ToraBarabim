import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAdminCoursePhoto, uploadAdminCoursePhoto } from '~/AdminPanel/api';
import { ADMIN_QUERY_KEYS } from '~/AdminPanel/consts';
import type { GalleryPhoto } from '~/components/GalleryField/models';

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
  uploadDraftsAfterCreate: (courseId: string) => Promise<File[]>;
}

// Mirrors `RabbiPanel/CourseFormPage/useCourseGalleryPhotos.ts`'s own
// create/edit duality (`courseId` undefined while creating holds every
// picked file locally, with no request, until `uploadDraftsAfterCreate`
// runs); duplicated here rather than shared because the two panels call
// different endpoints and invalidate different query keys. A shared hook
// parameterized by those two differences would remove the duplication; not
// attempted in this pass (see the report for this slice).
export const useCourseGalleryPhotos = (
  courseId: string | undefined,
  savedPhotos: { id: string; url: string }[],
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
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadAdminCoursePhoto(id, file),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => deleteAdminCoursePhoto(courseId as string, photoId),
    onSuccess: (course) => queryClient.setQueryData(ADMIN_QUERY_KEYS.course(courseId as string), course),
  });

  const runUpload = (id: string, localId: string, file: File): Promise<boolean> =>
    new Promise((resolve) => {
      uploadMutation.mutate(
        { id, file },
        {
          onSuccess: (course) => {
            queryClient.setQueryData(ADMIN_QUERY_KEYS.course(id), course);
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
