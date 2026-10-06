import { describe, expect, it } from 'vitest';

import { splitLastWord } from './helpers';

describe('splitLastWord', () => {
  it('splits the last word off a title, keeping the space with the lead', () => {
    expect(splitLastWord('לכל השיעורים של הרב אברהם כהן')).toEqual({ lead: 'לכל השיעורים של הרב אברהם ', last: 'כהן' });
  });

  it('gives a one-word title an empty lead', () => {
    expect(splitLastWord('שיעורים')).toEqual({ lead: '', last: 'שיעורים' });
  });

  it('keeps a hyphenated surname whole as the last word', () => {
    expect(splitLastWord('לכל השיעורים של הרב בן-ציון')).toEqual({ lead: 'לכל השיעורים של הרב ', last: 'בן-ציון' });
  });
});
