import type { HomeLessonRowId, HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { courseFixture } from '~/courseFixture';
import { DEDICATION_GROUP_SUCCESS } from '~/dedicationFixture';
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
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
});

const homeRow = (id: HomeLessonRowId, title: string): HomeRow => ({
  kind: 'lessons',
  id,
  title,
  items: [lessonItem(`${id}-1`, title), lessonItem(`${id}-2`, title), lessonItem(`${id}-3`, title)],
});

const courseRow = (): HomeRow => ({
  kind: 'courses',
  id: 'courses',
  title: 'קורסים',
  items: [courseFixture({ name: 'יסודות האמונה' }), courseFixture({ name: 'עיון בהלכות שבת', id: 'course-2' })],
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
    dedicationGroup: DEDICATION_GROUP_SUCCESS,
  },
};

// Below three lesson rails, the constraint "after at least two lesson rows"
// has no slot that is not also the very end of the list, so the
// between-rails band is skipped entirely, fail closed (design-system.md,
// dedication Placement).
export const TwoRailsNoBetweenRailsDedication: Story = {
  args: {
    query: queryWithRows([homeRow('area', 'שיעורים באזור שלך'), homeRow('today', 'הערב')]),
    dedicationGroup: DEDICATION_GROUP_SUCCESS,
  },
};

// Three rails, but the pool has no `success` dedications: no between-rails
// band, same as the two-rail case, but for a different reason.
export const NoSuccessDedications: Story = {
  args: {
    query: queryWithRows([homeRow('area', 'שיעורים באזור שלך'), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')]),
    dedicationGroup: undefined,
  },
};

// The course row (plan section 10.7): placed by the server right after the
// first lesson row, and not counted when placing the women's band or the
// dedication band, both of which still land after the second *lesson* row
// (index 3 here: lessons1, courses, lessons2, then the bands).
export const WithCourseRow: Story = {
  args: {
    query: queryWithRows([
      homeRow('area', 'שיעורים באזור שלך'),
      courseRow(),
      homeRow('today', 'הערב'),
      homeRow('weekly', 'שיעור שבועי'),
    ]),
    dedicationGroup: DEDICATION_GROUP_SUCCESS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = await canvas.findAllByRole('heading', { level: 2 });
    const headingTexts = headings.map((heading) => heading.textContent);

    expect(headingTexts[0]).toEqual('שיעורים באזור שלך');
    expect(headingTexts[1]).toEqual('קורסים');
    expect(headingTexts[2]).toEqual('הערב');
  },
};
