import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { deleteAdminCoursePhoto, uploadAdminCourseCover, uploadAdminCoursePhoto } from '~/AdminPanel/api';
import { CoursePreviewCard } from '~/AdminPanel/components/CoursePreviewCard/CoursePreviewCard';
import { ADMIN_QUERY_KEYS, ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage, describeAdminError } from '~/AdminPanel/helpers';
import { useExistingCourse } from '~/AdminPanel/useExistingCourse';
import { CourseFormFields } from '~/components/CourseFormFields/CourseFormFields';
import { courseToFormState, initialFormState, validateCourseForm } from '~/components/CourseFormFields/helpers';
import type { CourseFormErrors, CourseFormState } from '~/components/CourseFormFields/models';
import { useCourseCoverUpload } from '~/hooks/useCourseCoverUpload';
import { useCourseGalleryPhotos } from '~/hooks/useCourseGalleryPhotos';
import { usePhotoPreviewUrl } from '~/hooks/usePhotoPreviewUrl';

import { TeacherPicker } from './components/TeacherPicker/TeacherPicker';
import type { TeacherFormValue } from './components/TeacherPicker/models';
import * as consts from './consts';
import { initialTeacherState, pageHeading, teacherFromCourse, validateTeacher } from './helpers';
import type { CourseFormPageProps } from './models';
import * as styles from './styles';
import { useSaveCourse } from './useSaveCourse';

// A create that failed to upload every gallery photo hands the ones still
// local forward through `navigate`'s own `state` (mirrors `RabbiPanel/
// CourseFormPage.tsx`'s own reasoning).
interface CourseFormLocationState {
  failedGalleryFiles?: File[];
}

export const CourseFormPage = styled(({ className }: CourseFormPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as CourseFormLocationState | null;

  const existing = useExistingCourse(id);
  const saveCourse = useSaveCourse();
  const coverUpload = useCourseCoverUpload(id ?? '', {
    uploadCover: uploadAdminCourseCover,
    courseQueryKey: ADMIN_QUERY_KEYS.course,
    describeError: describeAdminError,
  });
  const gallery = useCourseGalleryPhotos(
    id,
    existing.status === 'success' ? existing.course.photos : [],
    { uploadPhoto: uploadAdminCoursePhoto, deletePhoto: deleteAdminCoursePhoto, courseQueryKey: ADMIN_QUERY_KEYS.course, describeError: describeAdminError },
    locationState?.failedGalleryFiles,
  );

  const [form, setForm] = useState<CourseFormState>(() => initialFormState());
  const [teacher, setTeacher] = useState<TeacherFormValue>(() => initialTeacherState());
  // The id of the course `form` was last loaded from: a duplicate lands on
  // this same route element with a new `id` but does not remount it
  // (mirrors `RabbiPanel/CourseFormPage.tsx`'s own reasoning).
  const [loadedCourseId, setLoadedCourseId] = useState<string | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<CourseFormErrors>({});
  const [teacherError, setTeacherError] = useState<string | undefined>(undefined);
  const [isUploadingDrafts, setIsUploadingDrafts] = useState(false);

  const newCoverPreviewUrl = usePhotoPreviewUrl(form.cover);

  useEffect(() => {
    if (existing.status === 'success' && existing.course.id !== loadedCourseId) {
      setForm(courseToFormState(existing.course));
      setTeacher(teacherFromCourse(existing.course));
      setLoadedCourseId(existing.course.id);
      setIsUploadingDrafts(false);
    }
  }, [existing, loadedCourseId]);

  // A closed course has no editable form: `ReadOnlyCourseRecord`-equivalent
  // is the view page itself for the admin panel, so navigate there instead
  // of rendering a form nothing here can save.
  useEffect(() => {
    if (id && existing.status === 'success' && existing.course.lifecycle.status === 'closed') {
      navigate(ADMIN_ROUTES.courseView(id), { replace: true });
    }
  }, [id, existing, navigate]);

  const isAudienceLocked = teacher.kind === 'rabbi' && teacher.rabbi.honorific === 'rabbanit';
  const effectiveForm: CourseFormState = isAudienceLocked ? { ...form, audience: 'women' } : form;

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
          <p className="message">{adminErrorMessage(existing.error, { 404: consts.LOAD_ERROR_MESSAGE })}</p>
          <button type="button" className="retry" onClick={existing.retry}>
            {consts.RETRY_LABEL}
          </button>
        </div>
      </div>
    );
  }

  // The effect above is already navigating away; render nothing rather than
  // a form for a course that cannot be saved.
  if (id && existing.status === 'success' && existing.course.lifecycle.status === 'closed') {
    return null;
  }

  const generalSaveError = saveCourse.isError ? adminErrorMessage(saveCourse.error) : undefined;

  const submit = (): void => {
    const errors = validateCourseForm(effectiveForm, !id);
    const nextTeacherError = validateTeacher(teacher);
    setFieldErrors(errors);
    setTeacherError(nextTeacherError);
    if (Object.keys(errors).length > 0 || nextTeacherError) return;

    saveCourse.mutate(
      { form: effectiveForm, teacher, existingCourseId: id },
      {
        onSuccess: async (course) => {
          if (id) {
            navigate(ADMIN_ROUTES.courseView(course.id));
            return;
          }
          // `saveCourse.isPending` already turned false once the create
          // itself resolved: the button holds its own state until these
          // still-local drafts finish uploading, so a second tap cannot
          // create a second course. Reset in a `finally`: a partial failure
          // navigates to the edit route of this same component instance
          // rather than away from it, so nothing else would ever clear the
          // flag.
          setIsUploadingDrafts(true);
          try {
            const failedFiles = await gallery.uploadDraftsAfterCreate(course.id);
            if (failedFiles.length === 0) navigate(ADMIN_ROUTES.courseView(course.id));
            else navigate(ADMIN_ROUTES.courseEdit(course.id), { state: { failedGalleryFiles: failedFiles } satisfies CourseFormLocationState });
          } finally {
            setIsUploadingDrafts(false);
          }
        },
      },
    );
  };

  const existingCoverUrl = existing.status === 'success' ? existing.course.coverUrl : undefined;
  const coverPreviewUrl = id ? (coverUpload.previewUrl ?? existingCoverUrl) : newCoverPreviewUrl;
  const backLink = id ? { to: ADMIN_ROUTES.courseView(id), label: consts.BACK_TO_RECORD_LABEL } : { to: ADMIN_ROUTES.courses, label: consts.BACK_TO_LIST_LABEL };

  return (
    <div className={className}>
      <Link className="breadcrumb" to={backLink.to}>
        {backLink.label}
      </Link>

      <div className="layout">
        <form
          className="main form"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          noValidate
        >
          <h1 className="heading">{pageHeading(Boolean(id))}</h1>

          {generalSaveError && (
            <p className="generalError" role="alert">
              {generalSaveError}
            </p>
          )}

          <section className="section teacherSection">
            <h2 className="sectionHeading">{consts.TEACHER_SECTION_HEADING}</h2>
            <p className="sectionHelp">{consts.TEACHER_SECTION_HELP}</p>
            <TeacherPicker {...{ teacher, onChangeTeacher: setTeacher, errorMessage: teacherError }} />
          </section>

          <CourseFormFields
            {...{
              form: effectiveForm,
              onChangeForm: setForm,
              fieldErrors,
              isAudienceLocked,
              cityError: fieldErrors.city,
              cover: {
                previewUrl: coverPreviewUrl,
                hasExistingPhoto: Boolean(id),
                uploadStatus: id ? coverUpload.status : undefined,
                failureReason: id ? coverUpload.failureReason : undefined,
                warning: id ? coverUpload.warning : undefined,
                onRetryUpload: coverUpload.retry,
                onSelectFile: (file) => (id ? coverUpload.upload(file) : setForm((prev) => ({ ...prev, cover: file }))),
              },
              gallery: { photos: gallery.photos, onAddFiles: gallery.addFiles, onRetry: gallery.retry, onRemove: gallery.remove },
            }}
          />

          <div className="footer">
            <button type="submit" className="save" disabled={saveCourse.isPending || isUploadingDrafts}>
              {isUploadingDrafts ? consts.UPLOADING_LABEL : saveCourse.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
            </button>
            <Link className="cancel" to={backLink.to}>
              {consts.CANCEL_LABEL}
            </Link>
          </div>
        </form>

        {existing.status === 'success' && (
          <aside className="preview">
            <CoursePreviewCard {...{ course: existing.course }} />
          </aside>
        )}
      </div>
    </div>
  );
})`
  ${styles.CourseFormPage}
`;
