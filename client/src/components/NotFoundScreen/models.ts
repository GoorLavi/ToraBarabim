interface NotFoundScreenBaseProps {
  className?: string;
  heading: string;
  explanation: string;
  actionLabel: string;
}

// A fact (not found) offers a way out, a link to somewhere else; a
// transient failure offers a retry, a button that runs again in place.
// Never both on the same screen (client/src/LessonPage/helpers.ts).
export type NotFoundScreenProps = NotFoundScreenBaseProps & ({ actionTo: string } | { onAction: () => void });
