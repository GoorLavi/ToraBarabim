import type { DedicationText } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';

import {
  DEDICATION_TEXT_HEALING,
  DEDICATION_TEXT_MEMORIAL_HYD,
  DEDICATION_TEXT_MEMORIAL_LONGEST_NAME,
  DEDICATION_TEXT_MEMORIAL_NO_DONOR_CREDIT,
  DEDICATION_TEXT_MEMORIAL_NO_PARENT,
  DEDICATION_TEXT_MEMORIAL_WRAPPING,
  DEDICATION_TEXT_SUCCESS,
} from '~/dedicationFixture';

import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { DedicationUnit } from './DedicationUnit';

const { colors } = ARGAMAN_VE_ZAHAV_THEME;

// The unit is fixed at 280 in every placement, so every story wraps it in a
// field the size of its variant's actual background: `primaryStrong`, the
// foot band's own field, for `onPrimary`; `bg` for `onPage` (design-system.md,
// dedication colour and geometry rules; DedicationBand/styles.ts). This is
// presentation glue for Storybook only, not a pattern for a real component.
const onPrimaryField = (Story: () => ReactNode) => (
  <div style={{ background: colors.primaryStrong, padding: '32px', display: 'inline-block' }}>
    <Story />
  </div>
);

const onPageField = (Story: () => ReactNode) => (
  <div style={{ background: colors.bg, padding: '32px', display: 'inline-block' }}>
    <Story />
  </div>
);

const meta: Meta<typeof DedicationUnit> = {
  title: 'components/DedicationUnit',
  component: DedicationUnit,
};

export default meta;
type Story = StoryObj<typeof DedicationUnit>;

export const MemorialOnPrimary: Story = {
  args: { text: DEDICATION_TEXT_MEMORIAL_WRAPPING, variant: 'onPrimary' },
  decorators: [onPrimaryField],
};

export const MemorialOnPage: Story = {
  args: { text: DEDICATION_TEXT_MEMORIAL_WRAPPING, variant: 'onPage' },
  decorators: [onPageField],
};

export const HealingOnPage: Story = {
  args: { text: DEDICATION_TEXT_HEALING, variant: 'onPage' },
  decorators: [onPageField],
};

export const SuccessOnPage: Story = {
  args: { text: DEDICATION_TEXT_SUCCESS, variant: 'onPage' },
  decorators: [onPageField],
};

export const NoParentLine: Story = {
  args: { text: DEDICATION_TEXT_MEMORIAL_NO_PARENT, variant: 'onPage' },
  decorators: [onPageField],
};

export const NoDonorCredit: Story = {
  args: { text: DEDICATION_TEXT_MEMORIAL_NO_DONOR_CREDIT, variant: 'onPage' },
  decorators: [onPageField],
};

export const HonorificHyd: Story = {
  args: { text: DEDICATION_TEXT_MEMORIAL_HYD, variant: 'onPage' },
  decorators: [onPageField],
};

// The wrapping instrument: several given names plus a family name plus the
// honorific wraps to more than two lines at 280, and none of it may be
// clipped (design-system.md, dedication hard rule 1).
export const LongestRealisticName: Story = {
  args: { text: DEDICATION_TEXT_MEMORIAL_LONGEST_NAME, variant: 'onPage' },
  decorators: [onPageField],
};

// Guards against a false pass: if both variants rendered at zero height
// (the story mounted before layout, say), the equality check below would
// pass and prove nothing.
const assertVariantsRenderAtEqualHeight = async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
  await waitFor(() => {
    const onPrimary = canvasElement.querySelector<HTMLElement>('.onPrimary');
    const onPage = canvasElement.querySelector<HTMLElement>('.onPage');
    if (!onPrimary || !onPage) throw new Error('DedicationUnit story: a variant root was not found');

    const primaryHeight = onPrimary.getBoundingClientRect().height;
    const pageHeight = onPage.getBoundingClientRect().height;
    expect(primaryHeight).toBeGreaterThan(50);
    expect(pageHeight).toBeGreaterThan(50);
    expect(primaryHeight).toEqual(pageHeight);
  });
};

// Both variants, side by side, each on its own field: the shared render
// both TwoVariantComparison and the height-equality stories below use.
const twoVariantComparison = (text: DedicationText): ReactElement => (
  <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
    <div style={{ background: colors.primaryStrong, padding: '32px', display: 'inline-block' }}>
      <DedicationUnit text={text} variant="onPrimary" />
    </div>
    <div style={{ background: colors.bg, padding: '32px', display: 'inline-block' }}>
      <DedicationUnit text={text} variant="onPage" />
    </div>
  </div>
);

// The instrument for the rendered-height check: both variants at 280,
// side by side, each on its own field. `DEDICATION_TEXT_MEMORIAL_WRAPPING`
// carries a donor credit line, visible on both sides here: 20/28 in
// dedicationMuted on the page field, unchanged gold on the plum field
// (only the size drops there, since both colour tokens already resolve to
// the same value). This is also the instrument that shows each Ornament
// instance's own gradient definition holding correctly against the other
// variant sitting right beside it on the same page: a shared gradient
// definition would paint both from whichever variant's context it sat in.
export const TwoVariantComparison: Story = {
  render: () => twoVariantComparison(DEDICATION_TEXT_MEMORIAL_WRAPPING),
  play: assertVariantsRenderAtEqualHeight,
};

// The designer measured the two variants identical to the tenth by hand;
// the compiler already stops a variant changing geometry (VARIANT_TOKENS
// is typed to colour keys only), but it cannot measure the rendered
// result, and a rule outside the variant blocks, a different shadow
// spread, anything that affects layout without going through the token
// table, would drift them apart silently. Checked at a short shape too
// (no parent, no donor), not only the full one above: the two could agree
// on one shape and not the other.
export const VariantsMatchHeightShortUnit: Story = {
  render: () => twoVariantComparison(DEDICATION_TEXT_MEMORIAL_NO_PARENT),
  play: assertVariantsRenderAtEqualHeight,
};
