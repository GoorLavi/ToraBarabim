import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { isTrackOverflowing, stepByUnitPitch, wrapTrackPosition } from '../../client/src/HomePage/components/DedicationBand/helpers';
import { WOMENS_AREA_BAND_SLOT } from '../../client/src/HomePage/components/HomeRails/consts';
import { dedicationBandSlot, shouldShowBetweenRailsDedication } from '../../client/src/HomePage/components/HomeRails/helpers';

// Pure logic, so this suite needs neither a database nor a built client,
// the same shape as rabbi-order.test.ts and dedication-text.test.ts.
// Type-only imports from common (none needed directly here: every function
// under test already carries its own parameter types), and every constant
// read from its own colocated consts.ts, the one exception being
// `stepByUnitPitch`'s pitch below.
//
// No assertion here compares `VARIANT_TOKENS.onPrimary`'s keys against
// `VARIANT_TOKENS.onPage`'s: `DedicationVariantTokens` (client/src/
// components/DedicationUnit/models.ts) has six fields, all required, none
// optional, and `VARIANT_TOKENS` is typed `Record<DedicationVariant,
// DedicationVariantTokens>`. A missing key in either entry is a compile
// error; an extra key is rejected by the object literal's excess-property
// check, which the C2 build verified by hand with a stray `paddingBlock`
// and `TS2353`. The two entries have identical key sets by construction,
// enforced on every build, including CI, and a runtime check here could
// only ever agree with it. If `DedicationVariantTokens` ever grows an
// optional field, that guarantee weakens and this assertion is worth
// adding back.
//
// `stepByUnitPitch`'s pitch below is an arbitrary test input, not a mirror
// of the real unit pitch (`DEDICATION_UNIT_WIDTH_PX` + `DEDICATION_UNIT_
// GAP_PX`, 280 + 64 in client/src/components/DedicationUnit/consts.ts and
// client/src/HomePage/components/DedicationBand/consts.ts): both live in
// files that reach the theme through the `~` alias, which only Vite
// resolves, so neither is reachable from here. `stepByUnitPitch` itself is
// a generic function that only needs a pitch, not that specific one, to
// prove its arithmetic, so this test makes no claim about what the real
// pitch is.
const TEST_UNIT_PITCH_PX = 100;

describe('isTrackOverflowing (the width test)', () => {
  test('a track narrower than its container does not crawl', () => {
    assert.equal(isTrackOverflowing(500, 800), false);
  });

  test('a track exactly as wide as its container does not crawl', () => {
    assert.equal(isTrackOverflowing(800, 800), false);
  });

  test('a track wider than its container crawls', () => {
    assert.equal(isTrackOverflowing(1200, 800), true);
  });
});

describe('wrapTrackPosition (the loop seam)', () => {
  test('advancing past the seam lands on the unwrapped position modulo one track width', () => {
    assert.equal(wrapTrackPosition(1050, 1000), 50);
  });

  test('stepping back across the start seam lands on the unwrapped position modulo one track width', () => {
    assert.equal(wrapTrackPosition(-50, 1000), 950);
  });

  test('advancing past the seam and stepping back across it land on the same equivalent position', () => {
    const trackWidthPx = 1000;
    const start = 950;

    const afterAdvance = wrapTrackPosition(start + 100, trackWidthPx);
    const afterStepBack = wrapTrackPosition(afterAdvance - 100, trackWidthPx);

    assert.equal(afterStepBack, start);
  });

  test('a position already inside the track is left untouched', () => {
    assert.equal(wrapTrackPosition(400, 1000), 400);
  });
});

describe('stepByUnitPitch (arrow key stepping)', () => {
  // The guarantee is where a press lands, not what it adds. Adding the
  // pitch to wherever the crawl happened to freeze preserves that
  // fractional offset forever, so every press keeps the reader the same
  // distance into a name. Landing on a pitch boundary is what "never lands
  // you mid-name" actually requires.
  test('a forward step lands on a unit boundary, from anywhere', () => {
    for (const from of [0, 40, 250, 260, 999]) {
      const landed = stepByUnitPitch(from, 1, TEST_UNIT_PITCH_PX);
      assert.equal(landed % TEST_UNIT_PITCH_PX, 0, `stepping forward from ${from} landed at ${landed}`);
      assert.ok(landed > from, `stepping forward from ${from} did not move forward`);
    }
  });

  test('a backward step lands on a unit boundary, from anywhere', () => {
    for (const from of [260, 250, 999]) {
      const landed = stepByUnitPitch(from, -1, TEST_UNIT_PITCH_PX);
      assert.equal(landed % TEST_UNIT_PITCH_PX, 0, `stepping back from ${from} landed at ${landed}`);
      assert.ok(landed < from, `stepping back from ${from} did not move back`);
    }
  });

  test('repeated steps do not drift out of alignment', () => {
    let position = 137;
    for (let i = 0; i < 9; i += 1) position = stepByUnitPitch(position, 1, TEST_UNIT_PITCH_PX);
    for (let i = 0; i < 9; i += 1) position = stepByUnitPitch(position, -1, TEST_UNIT_PITCH_PX);
    assert.equal(position % TEST_UNIT_PITCH_PX, 0, `ended mid-unit at ${position}`);
  });
});

describe('shouldShowBetweenRailsDedication and dedicationBandSlot (placement)', () => {
  test('below three rails, the between-rails band is skipped entirely, even with dedications to show', () => {
    assert.equal(shouldShowBetweenRailsDedication(0, true), false);
    assert.equal(shouldShowBetweenRailsDedication(1, true), false);
    assert.equal(shouldShowBetweenRailsDedication(2, true), false);
  });

  test('at three rails or more, with dedications to show, the band renders', () => {
    assert.equal(shouldShowBetweenRailsDedication(3, true), true);
    assert.equal(shouldShowBetweenRailsDedication(6, true), true);
  });

  test('with no dedications to show, the band never renders, whatever the rail count', () => {
    assert.equal(shouldShowBetweenRailsDedication(10, false), false);
  });

  test('the slot is WOMENS_AREA_BAND_SLOT itself when the women\'s-area tile is absent', () => {
    assert.equal(dedicationBandSlot(5, false), WOMENS_AREA_BAND_SLOT);
  });

  test('the slot moves one further, immediately after the tile, when it is present', () => {
    assert.equal(dedicationBandSlot(5, true), WOMENS_AREA_BAND_SLOT + 1);
  });
});
