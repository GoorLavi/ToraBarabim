import { TEXT_ENTRY_INPUT_TYPES_EXCLUDED } from './consts';

// Every focusable element still inside a dialog-shaped container, in tab
// order, so Tab can be made to cycle inside it instead of escaping it.
export const focusableElementsIn = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]')).filter(
    (element) => element.tabIndex !== -1,
  );

// Text the person can type into. A checkbox or a button holding focus is not
// typing, and nothing should be dismissed or interrupted past it.
export const isTextEntryElement = (element: Pick<HTMLElement, 'tagName' | 'isContentEditable'> & { type?: string }): boolean => {
  if (element.isContentEditable) return true;
  if (element.tagName === 'TEXTAREA') return true;
  if (element.tagName !== 'INPUT') return false;
  return !TEXT_ENTRY_INPUT_TYPES_EXCLUDED.has(element.type ?? 'text');
};
