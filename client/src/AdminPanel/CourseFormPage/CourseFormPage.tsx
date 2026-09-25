import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ADMIN_ROUTES } from '~/AdminPanel/consts';
import { adminErrorMessage } from '~/AdminPanel/helpers';
import { useExistingCourse } from '~/AdminPanel/useExistingCourse';
import { CourseFormFields } from '~/components/CourseFormFields/CourseFormFields';
import { courseToFormState, initialFormState, validateCourseForm } from '~/components/CourseFormFields/helpers';
import type { CourseFormErrors, CourseFormState } from '~/components/CourseFormFields/models';
import { usePhotoPreviewUrl } from '~/hooks/usePhotoPreviewUrl';

import { TeacherPicker } from './components/TeacherPicker/TeacherPicker';
import type { TeacherFormValue } from './components/TeacherPicker/models';
import * as consts from './consts';
import { initialTeacherState, pageHeading, teacherFromCourse, validateTeacher } from './helpers';
import type { CourseFormPageProps } from './models';
import * as styles from './styles';
import { useCourseCoverUpload } from './useCourseCoverUpload';
import { useCourseGalleryPhotos } from './useCourseGalleryPhotos';
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
  const coverUpload = useCourseCoverUpload(id ?? '');
  const gallery = useCourseGalleryPhotos(id, existing.status === 'success' ? existing.course.photos : [], locationState?.failedGalleryFiles);

  const [form, setForm] = useState<CourseFormState>(() => initialFormState());
  const [teacher, setTeacher] = useState<TeacherFormValue>(() => initialTeacherState());
  const [isLoadedFromExisting, setIsLoadedFromExisting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CourseFormErrors>({});
  const [teacherError, setTeacherError] = useState<string | undefined>(undefined);

  const newCoverPreviewUrl = usePhotoPreviewUrl(form.cover);

  useEffect(() => {
    if (existing.status === 'success' && !isLoadedFromExisting) {
      setForm(courseToFormState(existing.course));
      setTeacher(teacherFromCourse(existing.course));
      setIsLoadedFromExisting(true);
    }
  }, [existing, isLoadedFromExisting]);

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
          const failedFiles = await gallery.uploadDraftsAfterCreate(course.id);
          if (failedFiles.length === 0) navigate(ADMIN_ROUTES.courseView(course.id));
          else navigate(ADMIN_ROUTES.courseEdit(course.id), { state: { failedGalleryFiles: failedFiles } satisfies CourseFormLocationState });
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

      <form
        className="form"
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
              onRetryUpload: coverUpload.retry,
              onSelectFile: (file) => (id ? coverUpload.upload(file) : setForm((prev) => ({ ...prev, cover: file }))),
            },
            gallery: { photos: gallery.photos, onAddFiles: gallery.addFiles, onRetry: gallery.retry, onRemove: gallery.remove },
          }}
        />

        <div className="footer">
          <button type="submit" className="save" disabled={saveCourse.isPending}>
            {saveCourse.isPending ? consts.SAVING_LABEL : consts.SAVE_LABEL}
          </button>
          <Link className="cancel" to={backLink.to}>
            {consts.CANCEL_LABEL}
          </Link>
        </div>
      </form>
    </div>
  );
})`
  ${styles.CourseFormPage}
`;
