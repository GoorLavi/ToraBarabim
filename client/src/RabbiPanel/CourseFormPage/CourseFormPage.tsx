import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import type { CourseFormErrors, CourseFormState } from '~/components/CourseFormFields/models';
import { CourseFormFields } from '~/components/CourseFormFields/CourseFormFields';
import * as placePickerConsts from '~/components/PlacePicker/consts';
import { COURSE_CLOSE_REGISTRATION_ACTION_LABEL, COURSE_DELETE_ACTION_LABEL, COURSE_MARK_FULL_ACTION_LABEL } from '~/consts';
import { rabbiDisplayName } from '~/helpers';
import { useCourseCoverUpload } from '~/hooks/useCourseCoverUpload';
import { useCourseGalleryPhotos } from '~/hooks/useCourseGalleryPhotos';
import { usePhotoPreviewUrl } from '~/hooks/usePhotoPreviewUrl';
import { deleteCoursePhoto, RabbiApiError, uploadCourseCover, uploadCoursePhoto } from '~/RabbiPanel/api';
import { RABBI_QUERY_KEYS, RABBI_ROUTES } from '~/RabbiPanel/consts';
import { describeRabbiError, rabbiErrorMessage } from '~/RabbiPanel/helpers';
import { useRabbiProfile } from '~/RabbiPanel/useRabbiProfile';

import { CloseCourseSheet } from './components/CloseCourseSheet/CloseCourseSheet';
import { DeleteCourseSheet } from './components/DeleteCourseSheet/DeleteCourseSheet';
import { DuplicateCourseSheet } from './components/DuplicateCourseSheet/DuplicateCourseSheet';
import { MarkCourseFullSheet } from './components/MarkCourseFullSheet/MarkCourseFullSheet';
import { ReadOnlyCourseRecord } from './components/ReadOnlyCourseRecord/ReadOnlyCourseRecord';
import * as consts from './consts';
import { courseToFormState, initialFormState, pageHeading, validateCourseForm } from './helpers';
import type { CourseFormPageProps } from './models';
import * as styles from './styles';
import { useExistingCourse } from './useExistingCourse';
import { useSaveCourse } from './useSaveCourse';

type OpenSheet = 'close' | 'full' | 'delete' | 'duplicate' | undefined;

// A create that failed to upload every gallery photo hands the ones still
// local forward through `navigate`'s own `state`, read once here: an
// in-memory router transition, never serialized, so a `File` survives it
// unlike it would through a URL or `sessionStorage`.
interface CourseFormLocationState {
  failedGalleryFiles?: File[];
}

export const CourseFormPage = styled(({ className }: CourseFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as CourseFormLocationState | null;

  const profile = useRabbiProfile();
  const existing = useExistingCourse(id);
  const saveCourse = useSaveCourse();
  const coverUpload = useCourseCoverUpload(id ?? '', {
    uploadCover: uploadCourseCover,
    courseQueryKey: RABBI_QUERY_KEYS.course,
    describeError: describeRabbiError,
  });
  const gallery = useCourseGalleryPhotos(
    id,
    existing.status === 'success' ? existing.course.photos : [],
    { uploadPhoto: uploadCoursePhoto, deletePhoto: deleteCoursePhoto, courseQueryKey: RABBI_QUERY_KEYS.course, describeError: describeRabbiError },
    locationState?.failedGalleryFiles,
  );

  const [form, setForm] = useState<CourseFormState>(() => initialFormState());
  // The id of the course `form` was last loaded from, distinct from `id`
  // itself: navigating from a closed course's duplicate sheet lands on this
  // same route element with a new `id` but does not remount it, so the form
  // has to notice its own loaded id fell behind and reload from the new
  // course rather than keep showing the one it duplicated from.
  const [loadedCourseId, setLoadedCourseId] = useState<string | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<CourseFormErrors>({});
  const [openSheet, setOpenSheet] = useState<OpenSheet>(undefined);
  const [isUploadingDrafts, setIsUploadingDrafts] = useState(false);

  // Called unconditionally, ahead of every early return below (rules of
  // hooks): only its result is conditional, chosen against `coverUpload`'s
  // own preview further down, once `id` is known.
  const newCoverPreviewUrl = usePhotoPreviewUrl(form.cover);

  useEffect(() => {
    if (existing.status === 'success' && existing.course.id !== loadedCourseId) {
      setForm(courseToFormState(existing.course));
      setLoadedCourseId(existing.course.id);
      setOpenSheet(undefined);
      setIsUploadingDrafts(false);
    }
  }, [existing, loadedCourseId]);

  const isRabbaniteProfile = profile.data?.honorific === 'rabbanit';
  const effectiveForm: CourseFormState = isRabbaniteProfile ? { ...form, audience: 'women' } : form;

  if (id && existing.status === 'pending') {
    return (
      <div className={className}>
        <p className="state" aria-live="polite">
          {consts.LOADING_MESSAGE}
        </p>
      </div>
    );
  }

  if (id && existing.status === 'error') {
    return (
      <div className={className}>
        <div className="state error" role="alert">
          <p className="message">{rabbiErrorMessage(existing.error, { 404: consts.LOAD_ERROR_MESSAGE })}</p>
          <button type="button" className="retry" onClick={existing.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  const rabbiName = profile.data && rabbiDisplayName(profile.data);
  const courseNameForSheets = existing.status === 'success' ? existing.course.name : form.name || consts.NEW_HEADING;

  // The read-only record, once a course's registration is closed or it was
  // marked full: the same route both render (RabbiPanel.tsx), split here
  // rather than by a second component the router picks between, since both
  // need the same loaded course.
  if (existing.status === 'success' && existing.course.lifecycle.status === 'closed') {
    return (
      <div className={className}>
        <Link className="breadcrumb" to={RABBI_ROUTES.courses}>
          {consts.BACK_TO_LIST_LABEL}
        </Link>
        <ReadOnlyCourseRecord
          {...{
            course: existing.course,
            onOpenDuplicate: () => setOpenSheet('duplicate'),
            onOpenDelete: () => setOpenSheet('delete'),
          }}
        />
        {openSheet === 'duplicate' && (
          <DuplicateCourseSheet
            {...{
              courseId: existing.course.id,
              courseName: existing.course.name,
              sourceCycle: existing.course.cycle,
              onDismiss: () => setOpenSheet(undefined),
              onDuplicated: (course) => navigate(RABBI_ROUTES.courseEdit(course.id)),
            }}
          />
        )}
        {openSheet === 'delete' && (
          <DeleteCourseSheet
            {...{
              courseId: existing.course.id,
              courseName: existing.course.name,
              onDismiss: () => setOpenSheet(undefined),
              onDeleted: () => navigate(RABBI_ROUTES.courses),
            }}
          />
        )}
      </div>
    );
  }

  const saveErrorCode = saveCourse.error instanceof RabbiApiError ? saveCourse.error.code : undefined;
  const generalSaveError = saveCourse.isError && saveErrorCode !== 'unknown_city' ? rabbiErrorMessage(saveCourse.error) : undefined;
  const cityError = fieldErrors.city ?? (saveErrorCode === 'unknown_city' ? placePickerConsts.UNKNOWN_CITY_ERROR : undefined);

  const submit = (): void => {
    const errors = validateCourseForm(effectiveForm, !id);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    saveCourse.mutate(
      { form: effectiveForm, existingCourseId: id },
      {
        onSuccess: async (course) => {
          // Only a create ever has local, still-unsent gallery files: an
          // edit's own `gallery.addFiles` already uploads on selection.
          if (id) {
            navigate(RABBI_ROUTES.courses);
            return;
          }
          // `saveCourse.isPending` already turned false once the create
          // itself resolved, well before these drafts finish uploading: a
          // second tap on "save" while they are still in flight would create
          // a second course, so the button reads its own, separate state
          // until the navigation below actually leaves the page. Reset in a
          // `finally`: a partial failure navigates to the edit route of this
          // same component instance rather than away from it, so nothing
          // else would ever clear the flag.
          setIsUploadingDrafts(true);
          try {
            const failedFiles = await gallery.uploadDraftsAfterCreate(course.id);
            if (failedFiles.length === 0) navigate(RABBI_ROUTES.courses);
            else navigate(RABBI_ROUTES.courseEdit(course.id), { state: { failedGalleryFiles: failedFiles } satisfies CourseFormLocationState });
          } finally {
            setIsUploadingDrafts(false);
          }
        },
      },
    );
  };

  // After the early returns above, `id` set implies `existing.status ===
  // 'success'`: the pending and error states already returned, and the
  // closed-record branch already returned too.
  const existingCoverUrl = existing.status === 'success' ? existing.course.coverUrl : undefined;
  const coverPreviewUrl = id ? (coverUpload.previewUrl ?? existingCoverUrl) : newCoverPreviewUrl;

  return (
    <div className={className}>
      <Link className="breadcrumb" to={RABBI_ROUTES.courses}>
        {consts.BACK_TO_LIST_LABEL}
      </Link>

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        noValidate
      >
        <h1 className="heading">{pageHeading(Boolean(id))}</h1>
        {rabbiName && <p className="subtext">{consts.ownershipNote(rabbiName)}</p>}

        {generalSaveError && (
          <p className="generalError" role="alert">
            {generalSaveError}
          </p>
        )}

        <CourseFormFields
          {...{
            form: effectiveForm,
            onChangeForm: setForm,
            fieldErrors,
            isAudienceLocked: isRabbaniteProfile,
            cityError,
            cover: {
              previewUrl: coverPreviewUrl,
              hasExistingPhoto: Boolean(id),
              uploadStatus: id ? coverUpload.status : undefined,
              failureReason: id ? coverUpload.failureReason : undefined,
              onRetryUpload: coverUpload.retry,
              onSelectFile: (file) => (id ? coverUpload.upload(file) : setForm((prev) => ({ ...prev, cover: file }))),
            },
            gallery: { photos: gallery.photos, onAddFiles: gallery.addFiles, onRetry: gallery.retry, onRemove: gallery.remove },
          }}
        />

        <p className="liveNote">{consts.LIVE_NOTE}</p>

        <div className="footer">
          <button type="submit" className="save" disabled={saveCourse.isPending || isUploadingDrafts}>
            {isUploadingDrafts ? consts.UPLOADING_LABEL : saveCourse.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
          </button>
          <Link className="cancel" to={RABBI_ROUTES.courses}>
            {consts.CANCEL_LABEL}
          </Link>
        </div>

        {id && (
          <div className="dangerZone">
            <button type="button" className="action" onClick={() => setOpenSheet('full')}>
              {COURSE_MARK_FULL_ACTION_LABEL}
            </button>
            <button type="button" className="action" onClick={() => setOpenSheet('close')}>
              {COURSE_CLOSE_REGISTRATION_ACTION_LABEL}
            </button>
            <p className="helper">{consts.CLOSE_REGISTRATION_HELP}</p>
            <button type="button" className="action delete" onClick={() => setOpenSheet('delete')}>
              {COURSE_DELETE_ACTION_LABEL}
            </button>
          </div>
        )}
      </form>

      {id && openSheet === 'close' && (
        <CloseCourseSheet
          {...{ courseId: id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onClosed: () => setOpenSheet(undefined) }}
        />
      )}
      {id && openSheet === 'full' && (
        <MarkCourseFullSheet
          {...{ courseId: id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onMarkedFull: () => setOpenSheet(undefined) }}
        />
      )}
      {id && openSheet === 'delete' && (
        <DeleteCourseSheet
          {...{ courseId: id, courseName: courseNameForSheets, onDismiss: () => setOpenSheet(undefined), onDeleted: () => navigate(RABBI_ROUTES.courses) }}
        />
      )}
    </div>
  );
})`
  ${styles.CourseFormPage}
`;
