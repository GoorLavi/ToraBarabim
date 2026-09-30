import { expect, waitFor } from 'storybook/test';

import { DEDICATION_NAME_SIZE_FLOOR_PX, DEDICATION_UNIT_WIDTH_PX } from '~/components/DedicationUnit/consts';

// The guarantee behind an admin preview: a unit rendered outside the band
// still lands at the size the public site shows. At every real viewport the
// site's scale puts the name on its floor, so the floor is the one figure
// that tells "site scale" from the scale-1 fallback (52px).
export const expectDedicationRendersAtSiteScale = async (canvasElement: HTMLElement): Promise<void> => {
  await waitFor(() => {
    const unit = canvasElement.querySelector<HTMLElement>('.onPage');
    const name = unit?.querySelector<HTMLElement>('.name');
    if (!unit || !name) throw new Error('expected a preview DedicationUnit with a name line, found none');

    expect(getComputedStyle(name).fontSize).toEqual(`${DEDICATION_NAME_SIZE_FLOOR_PX}px`);
    expect(unit.getBoundingClientRect().width).toBeCloseTo(DEDICATION_UNIT_WIDTH_PX, 0);
  });
};
