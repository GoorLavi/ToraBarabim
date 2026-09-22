import type { PlaceLessonResponse, PlaceProfileResponse, RabbiDetailResponse, RabbiDirectoryResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { installMockFetch, jsonResponse, NEVER_RESOLVES, placeholderPhoto } from '~/storyMocks';

import { LessonFormPage } from './LessonFormPage';

const profile: PlaceProfileResponse = {
  id: 'place-1',
  slug: 'בית-הכנסת-המרכזי-אהל-יצחק-ומאיר',
  name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
  street: 'רחוב ויצמן 45',
  cityCode: 4000,
  cityName: 'נתניה',
  area: 'sharon',
  photoUrl: placeholderPhoto(1200, 675),
};

const rabbi = rabbiFixture({ id: 'rabbi-1', name: 'יעקב מזרחי', title: 'ראש ישיבה' });
const rabbiDetail: RabbiDetailResponse = { ...rabbi, lessonCount: 3, cities: [] };

const directory: RabbiDirectoryResponse = {
  items: [
    rabbiDetail,
    { ...rabbiFixture({ id: 'rabbi-2', name: 'נתן צבי אשכנזי הכהן מבני ברק' }), lessonCount: 1, cities: [] },
  ],
  page: 1,
  pageSize: 50,
  total: 2,
};
const emptyDirectory: RabbiDirectoryResponse = { items: [], page: 1, pageSize: 50, total: 0 };

const lesson: PlaceLessonResponse = {
  id: 'lesson-1',
  title: 'עיונים בפרשת השבוע',
  rabbiId: rabbi.id,
  venue: {
    kind: 'place',
    placeId: profile.id,
    slug: profile.slug,
    name: profile.name,
    street: profile.street,
    city: profile.cityName,
    citySlug: 'נתניה',
    area: profile.area,
  },
  topic: 'parasha',
  audience: 'mixed',
  recurrence: { kind: 'weekly', weekdays: [2] },
  startTime: '20:30',
  durationMinutes: 60,
  notes: 'להביא חומש',
  provenance: 'manual',
};

type ExistingLessonScenario = 'edit' | 'loading' | 'error' | 'none';
let existingLessonScenario: ExistingLessonScenario = 'none';

installMockFetch((url) => {
  if (url.pathname === '/v1/place/profile') return jsonResponse(200, profile);

  if (url.pathname === '/v1/rabbis') {
    const scope = url.searchParams.get('scope');
    return jsonResponse(200, scope === 'women' ? emptyDirectory : directory);
  }
  if (url.pathname === `/v1/rabbis/${rabbi.id}`) return jsonResponse(200, rabbiDetail);

  if (url.pathname === `/v1/place/lessons/${lesson.id}`) {
    if (existingLessonScenario === 'loading') return NEVER_RESOLVES;
    if (existingLessonScenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
    if (existingLessonScenario === 'edit') return jsonResponse(200, lesson);
  }

  return null;
});

const withRoute = (pathname: string, scenario: ExistingLessonScenario = 'none') => (Story: React.ComponentType): React.ReactElement => {
  existingLessonScenario = scenario;
  return (
    <Routes location={{ pathname, search: '', hash: '', state: null, key: 'story' }}>
      <Route path="/place/lessons/new" element={<Story />} />
      <Route path="/place/lessons/:id" element={<Story />} />
    </Routes>
  );
};

const meta: Meta<typeof LessonFormPage> = {
  title: 'PlacePanel/LessonFormPage',
  component: LessonFormPage,
  // This page renders inside PlaceShell's own gutter in the app; no story
  // mounts the shell, so `panelShellDecorator` stands in for it once
  // `fullscreen` cancels Storybook's own frame padding (design gate
  // finding).
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof LessonFormPage>;

// A blank form: no venue section anywhere on it (build brief), the rabbi
// picker is the first thing to fill in.
export const CreateMode: Story = { decorators: [withRoute('/place/lessons/new')] };

// Pre-filled from an existing lesson, its rabbi resolved by a second read
// (`useExistingLesson.ts`) since the lesson response itself only carries a
// bare `rabbiId`. The place's own name in the ownership note is the long
// name from the build brief.
export const EditMode: Story = { decorators: [withRoute(`/place/lessons/${lesson.id}`, 'edit')] };

export const EditModeLoading: Story = { decorators: [withRoute(`/place/lessons/${lesson.id}`, 'loading')] };
export const EditModeError: Story = { decorators: [withRoute(`/place/lessons/${lesson.id}`, 'error')] };
