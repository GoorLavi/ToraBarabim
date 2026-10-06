import { describe, expect, it } from 'vitest';

import { isTextEntryElement } from './helpers';

describe('isTextEntryElement', () => {
  const field = (tagName: string, type?: string, isContentEditable = false) => ({ tagName, type, isContentEditable });

  it('counts text inputs, text areas and editable regions as typing', () => {
    expect(isTextEntryElement(field('INPUT', 'text'))).toBe(true);
    expect(isTextEntryElement(field('INPUT', 'search'))).toBe(true);
    expect(isTextEntryElement(field('TEXTAREA'))).toBe(true);
    expect(isTextEntryElement(field('DIV', undefined, true))).toBe(true);
  });

  it('does not count a checkbox, a button or a link', () => {
    expect(isTextEntryElement(field('INPUT', 'checkbox'))).toBe(false);
    expect(isTextEntryElement(field('INPUT', 'submit'))).toBe(false);
    expect(isTextEntryElement(field('BUTTON'))).toBe(false);
    expect(isTextEntryElement(field('A'))).toBe(false);
  });
});
