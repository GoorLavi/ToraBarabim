import type { HelpTileKind, HomeLessonRowId, HomeRow, LessonOccurrence } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { courseFixture } from '~/courseFixture';
import { DEDICATION_GROUP_HEALING, DEDICATION_GROUP_SUCCESS } from '~/dedicationFixture';
import { whatsAppHref } from '~/helpers';
import { VISITOR_MESSAGE_TITLES } from '~/HomePage/components/consts';
import { rabbiFixture } from '~/rabbiFixture';

import { http } from '../../../../.storybook/apiMocks';
import * as shareTileConsts from '../LessonRail/components/ShareTile/consts';
import * as formConsts from './components/HelpWindow/components/VisitorMessageForm/consts';
import { HomeRails } from './HomeRails';
import type { HomeRowsQueryState } from './models';

const SUCCESS_FORMULA = /להצלחת/;
const HEALING_FORMULA = /לרפואה/;

// A band crawls its dedications, so a formula can appear more than once; the
// first is the one that marks where the band sits.
const firstText = async (canvas: ReturnType<typeof within>, pattern: RegExp): Promise<HTMLElement> => {
  const [first] = await canvas.findAllByText(pattern);
  if (!first) throw new Error(`HomeRails story: no text matches ${String(pattern)}`);
  return first;
};

const isFollowing = (anchor: Element, other: Element): boolean => Boolean(anchor.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING);

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
  data: { rows, womensAreaLessonCount: 12, rabbis: [], cities: [], dedications: [] },
  error: null,
  refetch: () => {},
});

const meta: Meta<typeof HomeRails> = {
  title: 'HomePage/HomeRails',
  component: HomeRails,
};

export default meta;
type Story = StoryObj<typeof HomeRails>;

// Both bands sit after the last rail when there are fewer rails than their
// slots (6 and 8), the success band first.
export const ThreeRailsBandsAfterLast: Story = {
  args: {
    query: queryWithRows([homeRow('area:sharon', 'שיעורים באזור השרון'), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')]),
    successGroup: DEDICATION_GROUP_SUCCESS,
    healingGroup: DEDICATION_GROUP_HEALING,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const successText = await firstText(canvas, SUCCESS_FORMULA);
    const healingText = await firstText(canvas, HEALING_FORMULA);

    expect(isFollowing(rowSection(canvasElement, 'שיעור שבועי'), successText)).toBe(true);
    expect(isFollowing(successText, healingText)).toBe(true);
  },
};

// Four rails, still under both slots: same clamp, with the women's band
// after rail 2 as ever.
export const FourRailsBandsAfterLast: Story = {
  args: {
    query: queryWithRows([
      homeRow('today', 'שיעורים היום'),
      homeRow('area:haifa', 'שיעורים באזור חיפה והקריות'),
      homeRow('bothAudiences', 'שיעורים לכולם'),
      homeRow('weekly', 'שיעורים קבועים השבוע'),
    ]),
    successGroup: DEDICATION_GROUP_SUCCESS,
    healingGroup: DEDICATION_GROUP_HEALING,
  },
};

const TEN_RAIL_TITLES: Array<[HomeLessonRowId, string]> = [
  ['today', 'שיעורים היום'],
  ['area:haifa', 'שיעורים באזור חיפה והקריות'],
  ['bothAudiences', 'שיעורים לכולם'],
  ['area:sharon', 'שיעורים באזור השרון'],
  ['weekly', 'שיעורים קבועים השבוע'],
  ['area:center', 'שיעורים באזור המרכז'],
  ['morning', 'שיעורי בוקר'],
  ['area:jerusalem', 'שיעורים באזור ירושלים'],
  ['midday', 'שיעורי צהריים'],
  ['area:south', 'שיעורים באזור הדרום'],
];

// The full page the server can now send: ten rails, the women's band after
// rail 2, the success band after rail 6, the healing band after rail 8, and
// the longest area title wrapping rather than truncating.
export const TenRailsWithBothBands: Story = {
  args: {
    query: queryWithRows(TEN_RAIL_TITLES.map(([id, title]) => homeRow(id, title))),
    successGroup: DEDICATION_GROUP_SUCCESS,
    healingGroup: DEDICATION_GROUP_HEALING,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const successText = await firstText(canvas, SUCCESS_FORMULA);
    const healingText = await firstText(canvas, HEALING_FORMULA);

    expect(isFollowing(rowSection(canvasElement, 'שיעורים באזור המרכז'), successText)).toBe(true);
    expect(isFollowing(successText, rowSection(canvasElement, 'שיעורי בוקר'))).toBe(true);
    expect(isFollowing(rowSection(canvasElement, 'שיעורים באזור ירושלים'), healingText)).toBe(true);
    expect(isFollowing(healingText, rowSection(canvasElement, 'שיעורי צהריים'))).toBe(true);
  },
};

// Three rails, but the pool has no dedications of either type: no band.
export const NoBandDedications: Story = {
  args: {
    query: queryWithRows([homeRow('area:sharon', 'שיעורים באזור השרון'), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')]),
    successGroup: undefined,
    healingGroup: undefined,
  },
};

// The course row (plan section 10.7): placed by the server right after the
// first lesson row, and not counted when placing the women's band or the
// dedication band, both of which still land after the second *lesson* row
// (index 3 here: lessons1, courses, lessons2, then the bands).
export const WithCourseRow: Story = {
  args: {
    query: queryWithRows([
      homeRow('area:sharon', 'שיעורים באזור שלך'),
      courseRow(),
      homeRow('today', 'הערב'),
      homeRow('weekly', 'שיעור שבועי'),
    ]),
    successGroup: DEDICATION_GROUP_SUCCESS, healingGroup: DEDICATION_GROUP_HEALING,
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

const helpRow = (id: HomeLessonRowId, title: string, helpTile: { kind: HelpTileKind; index: number }): HomeRow => ({
  kind: 'lessons',
  id,
  title,
  items: [lessonItem(`${id}-1`, title), lessonItem(`${id}-2`, title), lessonItem(`${id}-3`, title)],
  helpTile,
});

const rowSection = (canvasElement: HTMLElement, title: string): HTMLElement => {
  const heading = within(canvasElement).getByRole('heading', { level: 2, name: title });
  const section = heading.closest('section');
  if (!section) throw new Error(`HomeRails story: no section around the heading "${title}"`);
  return section;
};

const REQUEST_TILE_NAME = new RegExp(`^${VISITOR_MESSAGE_TITLES['rabbi-request']}`);

const dialogNamed = (kind: 'rabbi-request' | 'volunteer'): Promise<HTMLElement> =>
  within(document.body).findByRole('dialog', { name: VISITOR_MESSAGE_TITLES[kind] });

// All three kinds on one page, each in a different row, each at the slot the
// payload named.
export const HelpTilesInRails: Story = {
  args: {
    query: queryWithRows([
      helpRow('area:sharon', 'שיעורים באזור שלך', { kind: 'rabbi-request', index: 2 }),
      helpRow('today', 'הערב', { kind: 'volunteer', index: 3 }),
      helpRow('weekly', 'שיעור שבועי', { kind: 'share', index: 2 }),
    ]),
    successGroup: DEDICATION_GROUP_SUCCESS, healingGroup: DEDICATION_GROUP_HEALING,
  },
  play: async ({ canvasElement }) => {
    const requestSection = rowSection(canvasElement, 'שיעורים באזור שלך');
    const volunteerSection = rowSection(canvasElement, 'הערב');
    const shareSection = rowSection(canvasElement, 'שיעור שבועי');

    await expect(within(requestSection).getByRole('button', { name: REQUEST_TILE_NAME })).toBeInTheDocument();
    await expect(within(volunteerSection).getByRole('button', { name: new RegExp(`^${VISITOR_MESSAGE_TITLES.volunteer}`) })).toBeInTheDocument();
    await expect(within(shareSection).getByRole('link', { name: new RegExp(`^${shareTileConsts.TILE_TITLE}`) })).toHaveAttribute(
      'href',
      whatsAppHref(shareTileConsts.SHARE_MESSAGE),
    );

    // Index 2 of 3 items: after the second card, so two lesson links come first.
    const requestSlot = within(requestSection).getByRole('button', { name: REQUEST_TILE_NAME }).closest('li');
    await expect(requestSlot?.previousElementSibling?.previousElementSibling).not.toBeNull();
    await expect(requestSlot?.previousElementSibling?.previousElementSibling?.previousElementSibling).toBeNull();
  },
};

const postStored = { send: http.post('/v1/visitor-messages', () => new Response(null, { status: 204 })) };

// Closing the window by a stray tap on the backdrop never costs the visitor
// what they typed: reopening from the same tile restores it, and focus came
// back to the tile.
export const DraftKept: Story = {
  args: {
    query: queryWithRows([helpRow('area:sharon', 'שיעורים באזור שלך', { kind: 'rabbi-request', index: 2 }), homeRow('today', 'הערב'), homeRow('weekly', 'שיעור שבועי')]),
    successGroup: undefined, healingGroup: undefined,
  },
  parameters: { apiMocks: { handlers: postStored } },
  play: async ({ canvasElement }) => {
    const tile = within(canvasElement).getByRole('button', { name: REQUEST_TILE_NAME });
    await userEvent.click(tile);
    const dialog = await dialogNamed('rabbi-request');
    await userEvent.type(within(dialog).getByRole('textbox', { name: formConsts.FIELD_LABELS.name }), 'דוד כהן');
    await userEvent.type(within(dialog).getByRole('textbox', { name: formConsts.FIELD_LABELS.message }), 'הרב משה לוי מוסר שיעור בחיפה');

    // `fireEvent`: the panel covers the point a pointer would aim for.
    const backdrop = document.body.querySelector<HTMLElement>('[role="presentation"]');
    if (!backdrop) throw new Error('HomeRails story: the sheet backdrop was not found');
    fireEvent.click(backdrop);

    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(tile).toHaveFocus();

    await userEvent.click(tile);
    const reopened = await dialogNamed('rabbi-request');
    await expect(within(reopened).getByRole('textbox', { name: formConsts.FIELD_LABELS.name })).toHaveValue('דוד כהן');
    await expect(within(reopened).getByRole('textbox', { name: formConsts.FIELD_LABELS.message })).toHaveValue('הרב משה לוי מוסר שיעור בחיפה');
  },
};

const RESHUFFLE_BUTTON_LABEL = 'story: place the tile in another row';

const reshuffleRows = (tileRowId: 'area:sharon' | 'today'): HomeRow[] => [
  tileRowId === 'area:sharon' ? helpRow('area:sharon', 'שיעורים באזור שלך', { kind: 'rabbi-request', index: 2 }) : homeRow('area:sharon', 'שיעורים באזור שלך'),
  tileRowId === 'today' ? helpRow('today', 'הערב', { kind: 'rabbi-request', index: 3 }) : homeRow('today', 'הערב'),
  homeRow('weekly', 'שיעור שבועי'),
];

// Every request places the tiles anew, so a refetch can move the tile to
// another row while a visitor is typing. The window and the draft live above
// the tile, so they survive; only the tile underneath moves.
const ReshuffleStage = () => {
  const [tileRowId, setTileRowId] = useState<'area:sharon' | 'today'>('area:sharon');

  return (
    <>
      <button type="button" onClick={() => setTileRowId('today')}>
        {RESHUFFLE_BUTTON_LABEL}
      </button>
      <HomeRails {...{ query: queryWithRows(reshuffleRows(tileRowId)), successGroup: undefined, healingGroup: undefined }} />
    </>
  );
};

export const ReshuffleKeepsWindow: Story = {
  render: () => <ReshuffleStage />,
  parameters: { apiMocks: { handlers: postStored } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(rowSection(canvasElement, 'שיעורים באזור שלך')).getByRole('button', { name: REQUEST_TILE_NAME }));
    const dialog = await dialogNamed('rabbi-request');
    await userEvent.type(within(dialog).getByRole('textbox', { name: formConsts.FIELD_LABELS.name }), 'דוד כהן');

    // `fireEvent`: the open sheet's backdrop covers the page behind it.
    fireEvent.click(within(canvasElement).getByRole('button', { name: RESHUFFLE_BUTTON_LABEL }));

    await waitFor(() => expect(within(rowSection(canvasElement, 'הערב')).queryByRole('button', { name: REQUEST_TILE_NAME })).not.toBeNull());
    await expect(within(rowSection(canvasElement, 'שיעורים באזור שלך')).queryByRole('button', { name: REQUEST_TILE_NAME })).toBeNull();

    const stillOpen = await dialogNamed('rabbi-request');
    await expect(within(stillOpen).getByRole('textbox', { name: formConsts.FIELD_LABELS.name })).toHaveValue('דוד כהן');
  },
};
