import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import type { DedicationGroup, DedicationHonorific, DedicationText, DedicationType, HonoredGender } from '@torabarabim/common';

import * as fixtures from '../../client/src/dedicationFixture';
import {
  DEDICATION_FORMULA_BY_TYPE,
  DEDICATION_HONORIFIC_SUFFIX,
  DEDICATION_PARENT_PARTICLE,
} from '../src/service/dedication/consts';
import { dedicationRotationKey } from '../src/service/dedication/rotation';
import { composeDedicationText } from '../src/service/dedication/text';
import type { DedicationFields } from '../src/service/dedication/models';

const isDedicationText = (value: unknown): value is DedicationText =>
  typeof value === 'object' && value !== null && 'formulaLine' in value && 'nameLine' in value;

const isDedicationGroup = (value: unknown): value is DedicationGroup =>
  typeof value === 'object' && value !== null && 'type' in value && Array.isArray((value as DedicationGroup).items);

// Pure logic, so this suite needs neither a database nor a built client,
// the same shape as `rabbi-order.test.ts`. It exists because the composer
// is the one place a wrong non-breaking space, a wrong quote character, or
// a suffix leaking onto the wrong line would first show up, and none of
// that is reachable from `public-api.test.ts` without a live database.
const NBSP = ' ';
const GERSHAYIM = '״';

const fields = (overrides: Partial<DedicationFields> & { type: DedicationType }): DedicationFields => ({
  honoredName: 'משה כהן',
  honoredGender: 'male',
  closingLineEnabled: false,
  ...overrides,
});

describe('composeDedicationText', () => {
  describe('non-breaking spaces are load bearing at every named binding', () => {
    test('inside the memorial formula, לעילוי נשמת', () => {
      const { formulaLine } = composeDedicationText(fields({ type: 'memorial' }));
      assert.equal(formulaLine, `לעילוי${NBSP}נשמת`);
    });

    test('inside the healing formula, and after של', () => {
      const { formulaLine } = composeDedicationText(fields({ type: 'healing' }));
      assert.equal(formulaLine, `לרפואה${NBSP}שלמה${NBSP}של${NBSP}`);
      assert.ok(formulaLine.endsWith(`של${NBSP}`), 'expected a trailing NBSP after של, binding it to the name that follows');
    });

    test('after בן, on a male honoree’s parent line', () => {
      const { parentLine } = composeDedicationText(fields({ type: 'success', honoredGender: 'male', parentName: 'שלמה' }));
      assert.equal(parentLine, `בן${NBSP}שלמה`);
    });

    test('after בת, on a female honoree’s parent line', () => {
      const { parentLine } = composeDedicationText(fields({ type: 'success', honoredGender: 'female', parentName: 'רבקה' }));
      assert.equal(parentLine, `בת${NBSP}רבקה`);
    });

    test('between משפחת and the donor family name', () => {
      const { donorCreditLine } = composeDedicationText(fields({ type: 'success', donorFamilyName: 'לוי' }));
      assert.equal(donorCreditLine, `תרומת משפחת${NBSP}לוי`);
    });

    test('before ז״ל', () => {
      const { nameLine } = composeDedicationText(fields({ type: 'memorial', honoredName: 'יוסף כהן', honorific: 'zl' }));
      assert.equal(nameLine, `יוסף כהן${NBSP}ז${GERSHAYIM}ל`);
    });

    test('before ע״ה', () => {
      const { nameLine } = composeDedicationText(fields({ type: 'memorial', honoredName: 'שרה כהן', honorific: 'ah' }));
      assert.equal(nameLine, `שרה כהן${NBSP}ע${GERSHAYIM}ה`);
    });

    test('before הי״ד', () => {
      const { nameLine } = composeDedicationText(fields({ type: 'memorial', honoredName: 'דוד לוי', honorific: 'hyd' }));
      assert.equal(nameLine, `דוד לוי${NBSP}הי${GERSHAYIM}ד`);
    });
  });

  test('the stored field never contains U+00A0, only the composed segment does', () => {
    const honoredName = 'משה בן דוד';
    const { nameLine } = composeDedicationText(fields({ type: 'memorial', honoredName, honorific: 'zl' }));
    assert.ok(!honoredName.includes(NBSP), 'the raw stored field must stay a plain, clean name');
    assert.ok(nameLine.includes(NBSP), 'the composed nameLine is where the binding space lives');
  });

  describe('the honorific is never derived from gender', () => {
    test('a female record carrying zl composes ז״ל, not ע״ה', () => {
      const { nameLine } = composeDedicationText(
        fields({ type: 'memorial', honoredName: 'רחל', honoredGender: 'female', honorific: 'zl' }),
      );
      assert.equal(nameLine, `רחל${NBSP}ז${GERSHAYIM}ל`);
    });

    test('a male record carrying ah composes ע״ה, not ז״ל', () => {
      const { nameLine } = composeDedicationText(
        fields({ type: 'memorial', honoredName: 'יעקב', honoredGender: 'male', honorific: 'ah' }),
      );
      assert.equal(nameLine, `יעקב${NBSP}ע${GERSHAYIM}ה`);
    });
  });

  test('בן versus בת is the only gender-driven token, and the parent line never carries a suffix', () => {
    const honorifics: DedicationHonorific[] = ['zl', 'ah', 'hyd'];
    for (const honorific of honorifics) {
      for (const honoredGender of ['male', 'female'] as HonoredGender[]) {
        const { parentLine } = composeDedicationText(
          fields({ type: 'memorial', honoredGender, honorific, parentName: 'אברהם' }),
        );
        assert.ok(parentLine);
        assert.ok(!parentLine.includes(GERSHAYIM), 'the parent line must never carry a ז״ל / ע״ה / הי״ד suffix');
        assert.equal(parentLine, `${honoredGender === 'male' ? 'בן' : 'בת'}${NBSP}אברהם`);
      }
    }
  });

  test('no ASCII quote in any segment; the Hebrew punctuation forms use U+05F4', () => {
    const text = composeDedicationText(
      fields({
        type: 'memorial',
        honoredName: 'חנה',
        honorific: 'zl',
        parentName: 'שמעון',
        donorFamilyName: 'אשכנזי',
        closingLineEnabled: true,
      }),
    );
    for (const segment of Object.values(text)) {
      if (segment === undefined) continue;
      assert.ok(!segment.includes('"'), `expected no ASCII double quote in "${segment}"`);
      assert.ok(!segment.includes("'"), `expected no ASCII single quote in "${segment}"`);
    }
    assert.ok(text.nameLine.includes(GERSHAYIM));
    assert.ok(text.closingLine?.includes(GERSHAYIM));
    assert.equal(text.closingLine, `תנצב${GERSHAYIM}ה`);
  });

  test('four separate segments are produced, formula and name always present', () => {
    const text = composeDedicationText(fields({ type: 'success', honoredName: 'אליהו' }));
    assert.equal(typeof text.formulaLine, 'string');
    assert.equal(typeof text.nameLine, 'string');
    assert.equal(text.parentLine, undefined);
    assert.equal(text.closingLine, undefined);
    assert.equal(text.donorCreditLine, undefined);
  });

  test('the closing line is only ever composed for a memorial dedication, even when opted in', () => {
    const healing = composeDedicationText(fields({ type: 'healing', closingLineEnabled: true }));
    const success = composeDedicationText(fields({ type: 'success', closingLineEnabled: true }));
    assert.equal(healing.closingLine, undefined);
    assert.equal(success.closingLine, undefined);

    const memorialOptedOut = composeDedicationText(fields({ type: 'memorial', closingLineEnabled: false }));
    assert.equal(memorialOptedOut.closingLine, undefined);

    const memorialOptedIn = composeDedicationText(fields({ type: 'memorial', closingLineEnabled: true }));
    assert.equal(memorialOptedIn.closingLine, `תנצב${GERSHAYIM}ה`);
  });

  test('the donor credit and parent lines are absent, not empty, when their field is not set', () => {
    const text = composeDedicationText(fields({ type: 'memorial' }));
    assert.equal(text.parentLine, undefined);
    assert.equal(text.donorCreditLine, undefined);
    assert.ok(!('parentLine' in text) || text.parentLine === undefined);
  });

  test('the parent line is dropped, not guessed, when honoredGender is absent', () => {
    const text = composeDedicationText(fields({ type: 'success', honoredGender: undefined, parentName: 'שלמה' }));
    assert.equal(text.parentLine, undefined);
  });

  test('the closing suffix binds to the name line: a bare-parent record never closes with it', () => {
    const text = composeDedicationText(
      fields({ type: 'memorial', honoredName: 'משה', honorific: 'zl', parentName: 'אברהם', closingLineEnabled: false }),
    );
    assert.ok(!text.parentLine?.includes(GERSHAYIM));
    assert.ok(text.nameLine.includes(GERSHAYIM));
  });
});

describe('dedicationRotationKey', () => {
  test('is deterministic for a given date', () => {
    const date = new Date('2026-06-15T10:00:00Z');
    assert.equal(dedicationRotationKey('dedication-1', date), dedicationRotationKey('dedication-1', date));
  });

  // A stray `hashLessonId` import would fail this: that hash is documented
  // to never depend on the clock, so two different dates would produce the
  // same key every time, which this test rejects.
  test('differs across two Israel-calendar dates for the same id', () => {
    const first = new Date('2026-06-15T10:00:00Z');
    const second = new Date('2026-09-20T10:00:00Z');
    assert.notEqual(dedicationRotationKey('dedication-1', first), dedicationRotationKey('dedication-1', second));
  });
});

// The Storybook fixtures are hand-written copies of what `composeDedicationText`
// returns, and the design gate is judged against them, so a fixture that does not
// mirror the composer shows the reviewer behaviour that cannot happen. That is not
// hypothetical: an earlier revision bound every word of a name with a non-breaking
// space, which made every name unbreakable, and the longest one rendered 500px wide
// inside its 280px unit instead of wrapping. These assertions are against that
// defect. The fixture module imports nothing but types from `common`, which is what
// lets this suite reach across the workspace, the same way `dedication-band.test.ts`
// reaches the band's pure helpers.
describe('story fixtures mirror the composer', () => {
  const HONORIFIC_SUFFIXES = Object.values(DEDICATION_HONORIFIC_SUFFIX);
  const PARENT_PARTICLES = Object.values(DEDICATION_PARENT_PARTICLE);
  const FORMULAS = Object.values(DEDICATION_FORMULA_BY_TYPE);

  const everyText = (): DedicationText[] => [
    ...Object.values(fixtures).filter((value): value is DedicationText => isDedicationText(value)),
    ...Object.values(fixtures)
      .filter((value): value is DedicationGroup => isDedicationGroup(value))
      .flatMap((group) => group.items.map((item) => item.text)),
  ];

  test('every formula line is one the server actually composes', () => {
    for (const text of everyText()) {
      assert.ok(
        FORMULAS.includes(text.formulaLine),
        `formulaLine ${JSON.stringify(text.formulaLine)} is not one of the server's formulas`,
      );
    }
  });

  test('a name line binds a non-breaking space only before an honorific suffix', () => {
    for (const text of everyText()) {
      const [, bound, ...rest] = text.nameLine.split(NBSP);
      if (bound === undefined) continue;
      assert.equal(rest.length, 0, `nameLine ${JSON.stringify(text.nameLine)} binds more than the suffix`);
      assert.ok(
        HONORIFIC_SUFFIXES.includes(bound),
        `nameLine ${JSON.stringify(text.nameLine)} binds ${JSON.stringify(bound)}, which is not an honorific`,
      );
    }
  });

  test('a parent line binds a non-breaking space only after the particle', () => {
    for (const text of everyText()) {
      if (!text.parentLine) continue;
      const [particle, bound, ...rest] = text.parentLine.split(NBSP);
      assert.ok(
        bound !== undefined && rest.length === 0,
        `parentLine ${JSON.stringify(text.parentLine)} does not bind exactly the particle`,
      );
      assert.ok(
        particle !== undefined && PARENT_PARTICLES.includes(particle),
        `parentLine ${JSON.stringify(text.parentLine)} starts with ${JSON.stringify(particle)}, not בן or בת`,
      );
    }
  });

  test('no fixture line carries an ASCII quote', () => {
    for (const text of everyText()) {
      for (const line of Object.values(text)) {
        assert.ok(!/["']/.test(line), `${JSON.stringify(line)} carries an ASCII quote`);
      }
    }
  });
});
