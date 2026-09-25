import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { CourseResponse } from '@torabarabim/common';

import { TOO_LARGE_ERROR } from '~/components/PhotoPicker/consts';
import { courseErrorMessage, isCourseErrorCode } from '~/courseErrors';
import { GALLERY_REMOVE_FAILED_LABEL, GALLERY_UPLOAD_FAILED_LABEL } from '~/components/GalleryField/consts';
import type { GalleryPhoto } from '~/components/GalleryField/models';

export interface CourseGalleryPhotosApi {
  uploadPhoto: (courseId: string, file: File) => Promise<CourseResponse>;
  // The server answers 204 with no body: there is nothing left to return.
  deletePhoto: (courseId: string, photoId: string) => Promise<void>;
  courseQueryKey: (courseId: string) => QueryKey;
  // Reads a thrown error's code and details without this shared hook
  // importing either panel's own error class by name.
  describeError: (error: unknown) => { code?: string; details?: unknown; status: number } | undefined;
}

type PendingStatus = 'draft' | 'uploading' | 'failed';

interface PendingPhoto {
  localId: string;
  file: File;
  objectUrl: string;
  status: PendingStatus;
  failureReason?: string;
  canRetry: boolean;
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

// An approved rejection (the gallery already full) or a file over the
// upload limit will fail the same way every time it is retried; only a
// genuine network failure is worth offering a retry for.
const failureFrom = (api: CourseGalleryPhotosApi, error: unknown): { reason: string | undefined; canRetry: boolean } => {
  const info = api.describeError(error);
  if (!info) return { reason: undefined, canRetry: true };
  if (isCourseErrorCode(info.code)) return { reason: courseErrorMessage(info.code, info.details), canRetry: false };
  if (info.status === 413) return { reason: TOO_LARGE_ERROR, canRetry: false };
  return { reason: undefined, canRetry: true };
};

// Shared by the rabbi and admin panels' own course forms (lifted here once
// the admin panel became a second, identical caller). `courseId` is
// undefined while creating: `addFiles` then only ever holds a file locally
// (no request fires), since there is no course id yet to upload it to. Once
// a real id exists, either because this is an edit from the start or
// because `uploadDraftsAfterCreate` just ran, every further `addFiles` call
// uploads immediately, the same as the cover's own `useCourseCoverUpload`.
// The two panels differ only in which endpoints upload and delete a photo,
// which query key the result belongs under, and how to read their own
// error class, all passed in.
export const useCourseGalleryPhotos = (
  courseId: string | undefined,
  savedPhotos: { id: string; url: string }[],
  api: CourseGalleryPhotosApi,
  seedFailedFiles: File[] = [],
): CourseGalleryPhotosState => {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingPhoto[]>(() =>
    seedFailedFiles.map((file) => ({
      localId: crypto.randomUUID(),
      file,
      objectUrl: URL.createObjectURL(file),
      status: 'failed' as const,
      failureReason: GALLERY_UPLOAD_FAILED_LABEL,
      canRetry: true,
    })),
  );
  const [failedDeletes, setFailedDeletes] = useState<Map<string, { reason: string | undefined; canRetry: boolean }>>(new Map());
  const objectUrlsRef = useRef<Set<string>>(new Set(pending.map((photo) => photo.objectUrl)));

  useEffect(
    () => () => {
      for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    },
    [],
  );

  // `mutateAsync`-style direct calls rather than a shared `useMutation`
  // instance's `mutate` callbacks: a create can hold several local files
  // uploaded one after another, and each call's own `await` has to resolve
  // with that call's own result, not whichever call's callback TanStack
  // Query fired last.
  const runUpload = async (id: string, localId: string, file: File): Promise<boolean> => {
    try {
      const course = await api.uploadPhoto(id, file);
      // Merged by photo id, not replaced wholesale: `addFiles` fires one
      // request per file immediately, so several can be in flight together,
      // and a response that resolves late must not drop a photo a response
      // that resolved sooner already added to the cache.
      queryClient.setQueryData<CourseResponse>(api.courseQueryKey(id), (previous) => {
        const base = previous ?? course;
        const photosById = new Map(base.photos.map((photo) => [photo.id, photo]));
        for (const photo of course.photos) photosById.set(photo.id, photo);
        return { ...base, photos: Array.from(photosById.values()) };
      });
      setPending((prev) => {
        const item = prev.find((photo) => photo.localId === localId);
        if (item) {
          URL.revokeObjectURL(item.objectUrl);
          objectUrlsRef.current.delete(item.objectUrl);
        }
        return prev.filter((photo) => photo.localId !== localId);
      });
      return true;
    } catch (error) {
      const { reason, canRetry } = failureFrom(api, error);
      setPending((prev) =>
        prev.map((photo) => (photo.localId === localId ? { ...photo, status: 'failed', failureReason: reason ?? GALLERY_UPLOAD_FAILED_LABEL, canRetry } : photo)),
      );
      return false;
    }
  };

  const removeSaved = async (photoId: string): Promise<void> => {
    try {
      await api.deletePhoto(courseId as string, photoId);
      queryClient.setQueryData<CourseResponse>(api.courseQueryKey(courseId as string), (course) =>
        course ? { ...course, photos: course.photos.filter((photo) => photo.id !== photoId) } : course,
      );
      setFailedDeletes((prev) => {
        if (!prev.has(photoId)) return prev;
        const next = new Map(prev);
        next.delete(photoId);
        return next;
      });
    } catch (error) {
      const { reason, canRetry } = failureFrom(api, error);
      setFailedDeletes((prev) => new Map(prev).set(photoId, { reason: reason ?? GALLERY_REMOVE_FAILED_LABEL, canRetry }));
    }
  };

  const addFiles = (files: File[]): void => {
    for (const file of files) {
      const localId = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(objectUrl);
      setPending((prev) => [...prev, { localId, file, objectUrl, status: courseId ? 'uploading' : 'draft', canRetry: true }]);
      if (courseId) void runUpload(courseId, localId, file);
    }
  };

  const retry = (localId: string): void => {
    if (!courseId) return;
    if (failedDeletes.has(localId)) {
      void removeSaved(localId);
      return;
    }
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
    void removeSaved(id);
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
    ...savedPhotos.map((photo) => {
      const failure = failedDeletes.get(photo.id);
      return {
        id: photo.id,
        url: photo.url,
        status: failure ? ('failed' as const) : ('uploaded' as const),
        failureReason: failure?.reason,
        canRetry: failure?.canRetry,
      };
    }),
    ...pending.map((photo) => ({
      id: photo.localId,
      url: photo.objectUrl,
      status: photo.status === 'draft' ? ('uploaded' as const) : photo.status,
      failureReason: photo.failureReason,
      canRetry: photo.canRetry,
    })),
  ];

  return { photos, addFiles, retry, remove, uploadDraftsAfterCreate };
};
