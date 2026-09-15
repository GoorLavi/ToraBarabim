# Must-catch findings

1. **A rabbi's name rendered bare**: `<span className="name">{lesson.rabbi.name}</span>`
   shows the name without its honorific. Every surface goes through `rabbiDisplayName`
   (`CLAUDE.md`, Hebrew and Right-to-Left; decision 0026). A rabbanit shown as "שרה
   כהן" instead of "הרבנית שרה כהן" is a product defect, not a style nit. Blocking.

The rest of the card (the portrait fallback, the spread-free props, the class names) is
clean on purpose; the one sin is the bare name. A reviewer that passes this diff has
lost the honorific check.
