import { describe, expect, it } from 'vitest';

import { isIsraeliMobilePhone, normalizeIsraeliMobilePhone, whatsAppHref } from './helpers';

describe('normalizeIsraeliMobilePhone', () => {
  it.each(['052-123-4567', '+972521234567', '972 52 123 4567'])('normalises %s to the local form', (raw) => {
    expect(normalizeIsraeliMobilePhone(raw)).toBe('0521234567');
  });
});

describe('isIsraeliMobilePhone', () => {
  it.each(['052-123-4567', '+972521234567', '972 52 123 4567', '0521234567'])('accepts %s', (raw) => {
    expect(isIsraeliMobilePhone(raw)).toBe(true);
  });

  it.each(['03-1234567', '05212345', '', '0521234567890'])('rejects %s', (raw) => {
    expect(isIsraeliMobilePhone(raw)).toBe(false);
  });
});

describe('whatsAppHref', () => {
  it('opens the contact picker when no number is given', () => {
    expect(whatsAppHref('שלום')).toBe(`https://wa.me/?text=${encodeURIComponent('שלום')}`);
  });

  it('opens that number when one is given', () => {
    expect(whatsAppHref('שלום', '972521234567')).toBe(`https://wa.me/972521234567?text=${encodeURIComponent('שלום')}`);
  });
});
