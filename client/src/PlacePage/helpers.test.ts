import { describe, expect, it } from 'vitest';

import { placeAddressLine } from './helpers';

describe('placeAddressLine', () => {
  it('joins street, floor and city', () => {
    expect(placeAddressLine({ street: 'רחוב ויצמן 45', floor: 'קומה 2', city: 'נתניה' })).toBe('רחוב ויצמן 45, קומה 2, נתניה');
  });

  it('leaves out a floor the place does not have', () => {
    expect(placeAddressLine({ street: 'רחוב ויצמן 45', city: 'נתניה' })).toBe('רחוב ויצמן 45, נתניה');
  });

  it('never opens with a comma when the street is empty', () => {
    expect(placeAddressLine({ street: '', city: 'ירושלים' })).toBe('ירושלים');
  });
});
