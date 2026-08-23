export interface DeleteLessonSheetProps {
  className?: string;
  lessonId: string;
  lessonTitle: string;
  onDismiss: () => void;
  onDeleted: () => void;
}
