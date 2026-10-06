import { describe, expect, it } from 'vitest';

import { addOneDay, isIsraeliMobilePhone, israelDateTime, joinWithConjunction, normalizeIsraeliMobilePhone, placeIdPath, rabbiIdPath, sharedUrlOf, whatsAppHref } from './helpers';

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

describe('israelDateTime', () => {
  it('reads +03:00 in summer and +02:00 in winter', () => {
    expect(israelDateTime('2026-07-14', '20:30')).toBe('2026-07-14T20:30:00+03:00');
    expect(israelDateTime('2026-01-13', '20:30')).toBe('2026-01-13T20:30:00+02:00');
  });

  it('switches on the day the clocks change, 25 October 2026', () => {
    expect(israelDateTime('2026-10-24', '20:30')).toBe('2026-10-24T20:30:00+03:00');
    expect(israelDateTime('2026-10-25', '20:30')).toBe('2026-10-25T20:30:00+02:00');
  });
});

describe('addOneDay', () => {
  it('crosses a month and a year end', () => {
    expect(addOneDay('2026-07-31')).toBe('2026-08-01');
    expect(addOneDay('2026-12-31')).toBe('2027-01-01');
  });
});

describe('joinWithConjunction', () => {
  it('puts a vav before the last item and commas between the rest', () => {
    expect(joinWithConjunction([])).toBe('');
    expect(joinWithConjunction(['שני'])).toBe('שני');
    expect(joinWithConjunction(['שני', 'רביעי'])).toBe('שני ורביעי');
    expect(joinWithConjunction(['ראשון', 'שלישי', 'חמישי'])).toBe('ראשון, שלישי וחמישי');
  });
});

describe('shared links by id', () => {
  it('carries a rabbi or a place by id alone, never the percent-encoded Hebrew slug', () => {
    expect(sharedUrlOf(rabbiIdPath({ id: 'rabbi-1' }))).toBe('https://torahbarabim.com/rabbis/rabbi-1?s');
    expect(sharedUrlOf(placeIdPath({ id: 'place-1' }))).toBe('https://torahbarabim.com/places/place-1?s');
  });
});
