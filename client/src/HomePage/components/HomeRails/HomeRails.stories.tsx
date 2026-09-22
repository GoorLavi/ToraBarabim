import type { HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DEDICATION_GROUP_MEMORIAL } from '~/dedicationFixture';
import { rabbiFixture } from '~/rabbiFixture';

import { HomeRails } from './HomeRails';
import type { HomeRowsQueryState } from './models';

const lessonItem = (id: string, title: string): LessonOccurrence => ({
  lessonId: id,
  date: '2026-09-22',
  startTime: '20:00',
  endTime: '21:00',
  status: 'scheduled',
  title,
  topic: 'other',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: `rabbi-${id}`, name: 'יעקב מזרחי' }),
  place: { name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
});

const homeRow = (id: HomeRow['id'], title: string): HomeRow => ({
  id,
  title,
  items: [lessonItem(`${id}-1`, title), lessonItem(`${id}-2`, title), lessonItem(`${id}-3`, title)],
});

const queryWithRows = (rows: HomeRow[]): HomeRowsQueryState => ({
  isPending: false,
  isError: false,
  data: { rows, womensAreaLessonCount: 12, rabbis: [], dedications: [] },
  error: null,
  refetch: () => {},
});

const meta: Meta<typeof HomeRails> = {
  title: 'HomePage/HomeRails',
  component: HomeRails,
};

export default meta;
type Story = StoryObj<typeof HomeRails>;

// Three real rails: the between-rails band renders, right after the
// women's-area tile.
export const WithBetweenRailsDedication: Story = {
  args: {
    query: queryWithRows([homeRow('area', 'שיעורים באזור שלך'), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')]),
    dedicationGroup: DEDICATION_GROUP_MEMORIAL,
  },
};

// Below three rails, the constraint "after at least two rails" has no slot
// that is not also the very end of the list, so the between-rails band is
// skipped entirely, fail closed (design-system.md, dedication Placement).
export const TwoRailsNoBetweenRailsDedication: Story = {
  args: {
    query: queryWithRows([homeRow('area', 'שיעורים באזור שלך'), homeRow('today', 'הערב')]),
    dedicationGroup: DEDICATION_GROUP_MEMORIAL,
  },
};

// Three rails, but the draw has not resolved yet (or the pool is empty):
// no between-rails band, same as the two-rail case, but for a different
// reason.
export const NoDedicationGroupDrawn: Story = {
  args: {
    query: queryWithRows([homeRow('area', 'שיעורים באזור שלך'), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')]),
    dedicationGroup: undefined,
  },
};
