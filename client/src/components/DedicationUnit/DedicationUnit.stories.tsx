import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  DEDICATION_TEXT_HEALING,
  DEDICATION_TEXT_MEMORIAL_HYD,
  DEDICATION_TEXT_MEMORIAL_LONGEST_NAME,
  DEDICATION_TEXT_MEMORIAL_NO_DONOR_CREDIT,
  DEDICATION_TEXT_MEMORIAL_NO_PARENT,
  DEDICATION_TEXT_MEMORIAL_WRAPPING,
  DEDICATION_TEXT_SUCCESS,
} from '~/dedicationFixture';

import { DedicationUnit } from './DedicationUnit';

// The unit is fixed at 280 in every placement, so every story wraps it in a
// field the size of its variant's actual background: `primary` for
// `onPrimary`, `bg` for `onPage` (design-system.md, dedication colour and
// geometry rules). This is presentation glue for Storybook only, not a
// pattern for a real component.
const onPrimaryField = (Story: () => ReactNode) => (
  <div style={{ background: '#6B2436', padding: '32px', display: 'inline-block' }}>
    <Story />
  </div>
);

const onPageField = (Story: () => ReactNode) => (
  <div style={{ background: '#F7F4F3', padding: '32px', display: 'inline-block' }}>
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

// The instrument for the rendered-height check: both variants at 280,
// side by side, each on its own field. 314.2 unwrapped, 374.2 wrapped
// (design-system.md, dedication geometry).
export const TwoVariantComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      <div style={{ background: '#6B2436', padding: '32px', display: 'inline-block' }}>
        <DedicationUnit text={DEDICATION_TEXT_MEMORIAL_WRAPPING} variant="onPrimary" />
      </div>
      <div style={{ background: '#F7F4F3', padding: '32px', display: 'inline-block' }}>
        <DedicationUnit text={DEDICATION_TEXT_MEMORIAL_WRAPPING} variant="onPage" />
      </div>
    </div>
  ),
};
