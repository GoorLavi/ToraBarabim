import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DEDICATION_TEXT_HEALING, DEDICATION_TEXT_SUCCESS, dedicationFixture } from '../../client/src/dedicationFixture';
import { isTrackOverflowing, stepByUnitPitch, wrapTrackPosition } from '../../client/src/HomePage/components/DedicationBand/helpers';
import { WOMENS_AREA_BAND_SLOT } from '../../client/src/HomePage/components/HomeRails/consts';
import { dedicationBandSlot, shouldShowBetweenRailsDedication } from '../../client/src/HomePage/components/HomeRails/helpers';
import { drawDedication, drawDedicationGroup } from '../../client/src/HomePage/dedicationDraw';

// Pure logic, so this suite needs neither a database nor a built client,
// the same shape as rabbi-order.test.ts and dedication-text.test.ts.
// Type-only imports from common (none needed directly here: every function
// under test already carries its own parameter types), the RNG passed in
// as a parameter rather than a bare `Math.random()` call, and every
// constant read from its own colocated consts.ts, the one exception being
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
  test('a forward step moves exactly one unit pitch', () => {
    assert.equal(stepByUnitPitch(250, 1, TEST_UNIT_PITCH_PX), 250 + TEST_UNIT_PITCH_PX);
  });

  test('a backward step moves exactly one unit pitch, never a pixel amount', () => {
    assert.equal(stepByUnitPitch(250, -1, TEST_UNIT_PITCH_PX), 250 - TEST_UNIT_PITCH_PX);
  });
});

describe('drawDedication and drawDedicationGroup (the draw)', () => {
  // 1 item in one type, 19 in the other: drawing the type uniformly would
  // put the lone item at 50%, exactly what this catches.
  const soloGroup = { type: 'success' as const, items: [dedicationFixture({ id: 'solo-1', text: DEDICATION_TEXT_SUCCESS })] };
  const crowdedGroup = {
    type: 'healing' as const,
    items: Array.from({ length: 19 }, (_, index) => dedicationFixture({ id: `crowd-${index + 1}`, text: DEDICATION_TEXT_HEALING })),
  };
  const groups = [soloGroup, crowdedGroup];
  const allIds = groups.flatMap((group) => group.items.map((item) => item.id));

  const drawnId = (random: () => number): string => {
    const drawn = drawDedication(groups, random);
    assert.ok(drawn, 'expected a draw from a non-empty pool');
    return drawn.id;
  };

  test('an empty pool draws nothing', () => {
    assert.equal(drawDedication([], Math.random), undefined);
    assert.equal(drawDedicationGroup([], Math.random), undefined);
  });

  test('both branches draw units from exactly one group', () => {
    for (let index = 0; index < allIds.length; index += 1) {
      const random = (): number => index / allIds.length;
      const drawnGroup = drawDedicationGroup(groups, random);
      assert.ok(drawnGroup === soloGroup || drawnGroup === crowdedGroup, 'expected the exact original group object, never a mix');
    }
  });

  test('is a permutation: an evenly spaced sweep of exactly one draw per item hits every id exactly once', () => {
    const drawnIds = allIds.map((_, index) => drawnId(() => index / allIds.length));

    assert.deepEqual([...drawnIds].sort(), [...allIds].sort());
  });

  test('no systematic exclusion: every unit appears at least once across many draws', () => {
    const drawCount = allIds.length * 50;
    const seenIds = new Set<string>();
    for (let index = 0; index < drawCount; index += 1) {
      seenIds.add(drawnId(() => index / drawCount));
    }

    assert.deepEqual([...seenIds].sort(), [...allIds].sort());
  });

  test('weighted per dedication, not per type: an evenly spaced sweep visits each dedication the same number of times', () => {
    const repeatsPerItem = 1000;
    const drawCount = allIds.length * repeatsPerItem;

    const typeCounts: Record<'success' | 'healing' | 'memorial', number> = { success: 0, healing: 0, memorial: 0 };
    for (let index = 0; index < drawCount; index += 1) {
      const random = (): number => index / drawCount;
      const drawnGroup = drawDedicationGroup(groups, random);
      assert.ok(drawnGroup, 'expected a group from a non-empty pool');
      typeCounts[drawnGroup.type] += 1;
    }

    // A type-uniform draw would split this 50/50. Weighted per dedication,
    // the lone item's type gets exactly 1 of the pool's 20 dedications
    // (5%) and the crowded type gets the other 19 (95%).
    assert.equal(typeCounts.success, repeatsPerItem);
    assert.equal(typeCounts.healing, repeatsPerItem * 19);
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
