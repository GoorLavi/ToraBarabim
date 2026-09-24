import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import type { GalleryPhoto } from '~/components/GalleryField/models';
import { deleteCoursePhoto, uploadCoursePhoto } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS } from '~/RabbiPanel/consts';

interface PendingPhoto {
  localId: string;
  file: File;
  objectUrl: string;
  status: 'uploading' | 'failed';
}

export interface CourseGalleryPhotosState {
  photos: GalleryPhoto[];
  addFiles: (files: File[]) => void;
  retry: (localId: string) => void;
  remove: (photoId: string) => void;
}

// Every pending tile is a file this component already holds, uploaded one
// at a time through `RabbiPanel/api.ts`'s own single-file endpoint: there is
// no batch upload on the wire, so a multi-select just queues one request
// per file. A tile leaves `pending` only once its own request settles
// successfully; a failed one stays, with its object URL, until retried.
export const useCourseGalleryPhotos = (courseId: string, savedPhotos: { id: string; url: string }[]): CourseGalleryPhotosState => {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(
    () => () => {
      for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    },
    [],
  );

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCoursePhoto(courseId, file),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => deleteCoursePhoto(courseId, photoId),
    onSuccess: (course: CourseResponse) => queryClient.setQueryData(RABBI_QUERY_KEYS.course(courseId), course),
  });

  const runUpload = (localId: string, file: File): void => {
    uploadMutation.mutate(file, {
      onSuccess: (course) => {
        queryClient.setQueryData(RABBI_QUERY_KEYS.course(courseId), course);
        setPending((prev) => {
          const item = prev.find((photo) => photo.localId === localId);
          if (item) {
            URL.revokeObjectURL(item.objectUrl);
            objectUrlsRef.current.delete(item.objectUrl);
          }
          return prev.filter((photo) => photo.localId !== localId);
        });
      },
      onError: () => setPending((prev) => prev.map((photo) => (photo.localId === localId ? { ...photo, status: 'failed' } : photo))),
    });
  };

  const addFiles = (files: File[]): void => {
    for (const file of files) {
      const localId = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      setPending((prev) => [...prev, { localId, file, objectUrl, status: 'uploading' }]);
      runUpload(localId, file);
    }
  };

  const retry = (localId: string): void => {
    const item = pending.find((photo) => photo.localId === localId);
    if (!item) return;
    setPending((prev) => prev.map((photo) => (photo.localId === localId ? { ...photo, status: 'uploading' } : photo)));
    runUpload(localId, item.file);
  };

  const photos: GalleryPhoto[] = [
    ...savedPhotos.map((photo) => ({ id: photo.id, url: photo.url, status: 'uploaded' as const })),
    ...pending.map((photo) => ({ id: photo.localId, url: photo.objectUrl, status: photo.status })),
  ];

  return { photos, addFiles, retry, remove: (photoId: string) => deleteMutation.mutate(photoId) };
};
