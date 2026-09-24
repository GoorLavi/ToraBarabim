import type { HomeResponse, HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType } from 'react';

import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL, DEDICATION_GROUP_SUCCESS } from '~/dedicationFixture';
import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse } from '~/storyMocks';

import { HomePage } from './HomePage';

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

const homeRow = (id: HomeRow['id'], title: string): HomeRow => ({
  id,
  title,
  items: [lessonItem(`${id}-1`, title), lessonItem(`${id}-2`, title), lessonItem(`${id}-3`, title)],
});

type DedicationScenario = 'allThreeBands' | 'oneTypeAbsent' | 'twoTypesAbsent';

const dedicationsFor = (scenario: DedicationScenario): HomeResponse['dedications'] => {
  if (scenario === 'allThreeBands') return [DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_HEALING, DEDICATION_GROUP_MEMORIAL];
  // Healing absent: no hole opens between the rails block and RabbiRow.
  if (scenario === 'oneTypeAbsent') return [DEDICATION_GROUP_SUCCESS, DEDICATION_GROUP_MEMORIAL];
  // Healing and memorial both absent: only the between-rails success band renders.
  return [DEDICATION_GROUP_SUCCESS];
};

// `GET /v1/home` takes no query parameters (api.ts), so, like WomenPage's
// own `summaryScenario`, the mock cannot tell stories apart by the request
// itself: each story's decorator sets this before the page mounts instead.
let dedicationScenario: DedicationScenario = 'allThreeBands';

// Three real rails, the minimum the between-rails band needs
// (HomeRails/consts.ts, WOMENS_AREA_BAND_SLOT), and a positive
// `womensAreaLessonCount`, so the success band's real slot, immediately
// after the women's-area tile, is the one on screen rather than the
// tile-absent fallback slot.
const homeResponse = (): HomeResponse => ({
  rows: [homeRow('area', 'שיעורים באזור שלך'), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')],
  womensAreaLessonCount: 12,
  rabbis: [rabbiFixture({ id: 'rabbi-row-1', name: 'משה לוי' }), rabbiFixture({ id: 'rabbi-row-2', name: 'דוד כהן' })],
  dedications: dedicationsFor(dedicationScenario),
});

installMockFetch((url) => {
  if (decodeURIComponent(url.pathname) === '/v1/home') return jsonResponse(200, homeResponse());
  return null;
});

const withDedicationScenario = (scenario: DedicationScenario) => (Story: ComponentType) => {
  dedicationScenario = scenario;
  return <Story />;
};

const meta: Meta<typeof HomePage> = {
  title: 'HomePage/HomePage',
  component: HomePage,
  // The page owns its own gutter (styles.ts), so this only cancels
  // Storybook's own frame padding, matching every other page-level story
  // (PlacePage.stories.tsx).
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HomePage>;

// The full `.band` column in page order: the success band in its real slot
// inside the rails, right after the women's-area tile, the healing band
// between the rails block and `RabbiRow`, then `RabbiRow`, `CityGrid` and
// `ContactCta`, and the memorial band last, full-bleed at the foot. No
// filters active, so the page is in rail mode (helpers.ts, resolveHomeMode).
export const AllThreeBands: Story = { decorators: [withDedicationScenario('allThreeBands')] };

export const OneTypeAbsent: Story = { decorators: [withDedicationScenario('oneTypeAbsent')] };

export const TwoTypesAbsent: Story = { decorators: [withDedicationScenario('twoTypesAbsent')] };
