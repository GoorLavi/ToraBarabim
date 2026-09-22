import type { CityDetailResponse, LessonOccurrence, Place } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';

import { rabbiFixture } from '~/rabbiFixture';
import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { PlacePage } from './PlacePage';

const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="lightgray"/></svg>');

const place = (overrides: Partial<Place>): Place => ({
  id: 'story-place',
  slug: 'בית-הכנסת-המרכזי',
  name: 'בית הכנסת המרכזי',
  street: 'רחוב ויצמן 45',
  city: 'נתניה',
  citySlug: 'נתניה',
  area: 'sharon',
  ...overrides,
});

const lesson = (overrides: Partial<LessonOccurrence>): LessonOccurrence => ({
  lessonId: 'lesson-1',
  date: '2026-09-10',
  startTime: '20:30',
  endTime: '21:15',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: 'r1', name: 'אברהם כהן' }),
  venue: { kind: 'place', placeId: 'story-place', slug: 'בית-הכנסת-המרכזי', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
  ...overrides,
});

const cityDetail = (overrides: Partial<CityDetailResponse>): CityDetailResponse => ({
  id: '4100',
  name: 'נתניה',
  slug: 'נתניה',
  area: 'sharon',
  areaName: 'השרון',
  areaSlug: 'השרון',
  rabbis: [],
  ...overrides,
});

installMockFetch((url) => {
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/v1/places/story-populated') return jsonResponse(200, place({ id: 'story-populated', photoUrl: PLACEHOLDER_PHOTO }));
  if (pathname === '/v1/places/story-nophoto') return jsonResponse(200, place({ id: 'story-nophoto' }));
  if (pathname === '/v1/places/story-withfloor') return jsonResponse(200, place({ id: 'story-withfloor', floor: 'קומה 2, דלת שמאל' }));
  if (pathname === '/v1/places/story-empty-widened') return jsonResponse(200, place({ id: 'story-empty-widened', citySlug: 'נתניה' }));
  if (pathname === '/v1/places/story-empty-also') return jsonResponse(200, place({ id: 'story-empty-also', citySlug: 'עיר-ריקה' }));
  if (pathname === '/v1/places/story-longname') {
    return jsonResponse(
      200,
      place({
        id: 'story-longname',
        name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
        street: 'שדרות ירושלים הארוכה במיוחד לצורך הבדיקה 128',
        city: 'קריית מלאכי והמושבים הסמוכים לה בעוטף עזה',
        citySlug: 'קריית-מלאכי-והמושבים-הסמוכים-לה-בעוטף-עזה',
        photoUrl: PLACEHOLDER_PHOTO,
      }),
    );
  }
  if (pathname === '/v1/places/story-lessons-loading') return jsonResponse(200, place({ id: 'story-lessons-loading', photoUrl: PLACEHOLDER_PHOTO }));
  if (pathname === '/v1/places/story-notfound') return jsonResponse(404, { error: 'place_not_found', message: 'לא נמצא' });
  if (pathname === '/v1/places/story-error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  if (pathname === '/v1/places/story-loading') return NEVER_RESOLVES;

  if (pathname === '/v1/lessons') {
    const placeId = url.searchParams.get('placeId');
    const city = url.searchParams.get('city');

    if (placeId === 'story-lessons-loading') return NEVER_RESOLVES;

    if (placeId === 'story-populated' || placeId === 'story-longname') {
      return jsonResponse(200, {
        items: [
          lesson({ lessonId: 'l1', date: '2026-09-10', startTime: '20:30' }),
          lesson({ lessonId: 'l2', date: '2026-09-13', startTime: '19:00', audience: 'women' }),
        ],
        page: 1,
        pageSize: 50,
        total: 2,
      });
    }
    if (placeId === 'story-withfloor') {
      return jsonResponse(200, { items: [lesson({ lessonId: 'l3' })], page: 1, pageSize: 50, total: 1 });
    }
    if (placeId === 'story-nophoto' || placeId === 'story-empty-widened' || placeId === 'story-empty-also') {
      return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
    }
    if (city === '4100') {
      return jsonResponse(200, {
        items: [lesson({ lessonId: 'w1', rabbi: rabbiFixture({ id: 'r9', name: 'שמעון אזולאי' }) })],
        page: 1,
        pageSize: 4,
        total: 1,
      });
    }
    if (city === '46') return jsonResponse(200, { items: [], page: 1, pageSize: 4, total: 0 });
    return jsonResponse(200, { items: [], page: 1, pageSize: 50, total: 0 });
  }

  if (pathname === '/v1/cities/נתניה') return jsonResponse(200, cityDetail({}));
  if (pathname === '/v1/cities/עיר-ריקה') return jsonResponse(200, cityDetail({ id: '46', name: 'עיר-ריקה', slug: 'עיר-ריקה' }));

  return null;
});

// See RabbiPage.stories.tsx for why this uses `Routes`'s `location` override
// instead of a second, nested MemoryRouter.
const withRoute = (placeId: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/places/${placeId}`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/places/:placeId/:slug?" element={<Story />} />
  </Routes>
);

const meta: Meta<typeof PlacePage> = {
  title: 'PlacePage/PlacePage',
  component: PlacePage,
};

export default meta;
type Story = StoryObj<typeof PlacePage>;

export const Populated: Story = { decorators: [withRoute('story-populated')] };
export const NoPhoto: Story = { decorators: [withRoute('story-nophoto')] };
export const WithFloor: Story = { decorators: [withRoute('story-withfloor')] };
export const EmptyWidenedToCity: Story = { decorators: [withRoute('story-empty-widened')] };
export const EmptyCityAlsoEmpty: Story = { decorators: [withRoute('story-empty-also')] };
export const VeryLongName: Story = { decorators: [withRoute('story-longname')] };
export const NotFound: Story = { decorators: [withRoute('story-notfound')] };
export const ServerError: Story = { decorators: [withRoute('story-error')] };
// The head never gets its own skeleton (build brief), so this exercises the
// one loading state PlacePage does draw: the lesson section's
// `DayGroupSkeleton`, once the place itself has resolved.
export const LessonsLoading: Story = { decorators: [withRoute('story-lessons-loading')] };
