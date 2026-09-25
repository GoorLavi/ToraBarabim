export interface DeleteCourseSheetProps {
  courseId: string;
  courseName: string;
  onDismiss: () => void;
  onDeleted: () => void;
}
