import type { AdminVisitorMessage, UpdateVisitorMessageRequest, VisitorMessageListResponse } from '@torabarabim/common';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { panelShellDecorator } from '~/storyDecorators';

import { errorResolver, http, loadingResolver, queryOf, respondWithJson } from '../../../.storybook/apiMocks';
import type { MockResolver, MockRoute } from '../../../.storybook/apiMocks';
import { MessagesListPage } from './MessagesListPage';
import * as consts from './consts';
import * as cardConsts from './components/MessageCard/consts';
import * as noteConsts from './components/MessageCard/components/HandlingNote/consts';

const LONG_MESSAGE = `${'שלום רב, אני כותב כדי להמליץ על רב שמוסר שיעורים בעיר שלנו כבר שנים רבות. '.repeat(13)}`.trim().slice(0, 1000);
const UNBROKEN_NAME = 'א'.repeat(80);

const unhandled = (overrides: Partial<Extract<AdminVisitorMessage, { status: 'unhandled' }>>): AdminVisitorMessage => ({
  id: 'message-1',
  type: 'rabbi-request',
  name: 'דוד כהן',
  phone: '0521234567',
  message: 'מכירים את הרב משה לוי מבית הכנסת "אוהל יעקב" בחיפה.\nהוא מוסר שיעור בדף היומי בכל בוקר.',
  createdAt: '2026-10-01T11:32:00.000Z',
  handlingNote: null,
  status: 'unhandled',
  ...overrides,
});

const handled = (overrides: Partial<Extract<AdminVisitorMessage, { status: 'handled' }>>): AdminVisitorMessage => ({
  id: 'message-handled',
  type: 'volunteer',
  name: 'רחל אברמוביץ',
  phone: '0547654321',
  message: 'אשמח לעזור בעדכון השיעורים באזור ירושלים.',
  createdAt: '2026-09-28T07:05:00.000Z',
  handlingNote: null,
  status: 'handled',
  handledAt: '2026-09-29T09:00:00.000Z',
  ...overrides,
});

const LONG_NOTE = 'שוחחנו עם הגבאי בטלפון.\nהרב מוסר שלושה שיעורים בשבוע, והוא ישלח לנו את הזמנים.\nנוספו שני השיעורים הראשונים, השלישי ממתין לאישור.';

const mixedMessages: AdminVisitorMessage[] = [
  unhandled({ id: 'message-1' }),
  unhandled({ id: 'message-2', type: 'volunteer', name: 'Sarah Levi', phone: '0501112233', message: 'I would like to volunteer. I can help on weekday evenings.' }),
  unhandled({ id: 'message-3', name: UNBROKEN_NAME, message: LONG_MESSAGE, phone: '0529998877' }),
  handled({ id: 'message-4', handlingNote: LONG_NOTE }),
  handled({ id: 'message-5', type: 'rabbi-request', name: 'יוסף מזרחי', phone: '0585550000', message: 'הרב אליהו כהן מוסר שיעור בפרשת השבוע בנתניה.' }),
];

// The server's own rule: `handled: true` keeps an existing `handledAt`,
// `false` clears it; a note is trimmed and an empty result is null.
const applyUpdate = (message: AdminVisitorMessage, body: UpdateVisitorMessageRequest): AdminVisitorMessage => {
  const handlingNote = 'handlingNote' in body && body.handlingNote !== undefined ? body.handlingNote.trim() || null : message.handlingNote;
  const { status: _status, ...rest } = message;
  const wantsHandled = body.handled ?? message.status === 'handled';
  if (!wantsHandled) return { ...rest, handlingNote, status: 'unhandled' };
  const handledAt = message.status === 'handled' ? message.handledAt : '2026-10-01T12:00:00.000Z';
  return { ...rest, handlingNote, status: 'handled', handledAt };
};

// Every PATCH body a story's own handler received, so a `play` can assert
// what was sent (and that only the intended key was).
const patchBodies: UpdateVisitorMessageRequest[] = [];

const PAGE_SIZE_FOR_LOAD_MORE = 2;

// The server's cursor is opaque and holds a `|`; the mock builds one the same
// shape, so a story also proves it survives the trip through a query string.
const cursorFor = (item: AdminVisitorMessage): string => `${item.createdAt}|${item.id}`;

// The `before` of every list request a story's handler received, in order
// (`null` for the first page), so a `play` can assert the cursor travelled.
const requestedCursors: (string | null)[] = [];

const listResolver =
  (items: AdminVisitorMessage[], options: { pageSize?: number } = {}): MockResolver =>
  ({ request }) => {
    const query = queryOf(request);
    const status = query.get('status') ?? 'all';
    const before = query.get('before');
    requestedCursors.push(before);

    const filtered = items.filter((item) => status === 'all' || item.status === status);
    const pageSize = options.pageSize ?? Number(query.get('pageSize') ?? '50');
    const start = before === null ? 0 : filtered.findIndex((item) => cursorFor(item) === before) + 1;
    const pageItems = filtered.slice(start, start + pageSize);
    const lastItem = pageItems.at(-1);
    const hasOlder = start + pageSize < filtered.length;
    const body: VisitorMessageListResponse = {
      items: pageItems,
      pageSize,
      nextCursor: lastItem && hasOlder ? cursorFor(lastItem) : null,
      unfilteredTotal: items.length,
    };
    return respondWithJson(body);
  };

const updateResolver =
  (items: AdminVisitorMessage[]): MockResolver =>
  async ({ request, params }) => {
    const body = (await request.json()) as UpdateVisitorMessageRequest;
    patchBodies.push(body);
    const target = items.find((item) => item.id === params.id);
    if (!target) return respondWithJson({ error: 'not_found', message: 'לא נמצא' }, 404);
    return respondWithJson(applyUpdate(target, body));
  };

// Records the body like the working one, then fails: the story asserts what a
// failed save sent as well as what it showed.
const failingUpdateResolver: MockResolver = async ({ request }) => {
  patchBodies.push((await request.json()) as UpdateVisitorMessageRequest);
  return respondWithJson({ error: 'internal_error', message: 'שגיאה' }, 500);
};

const handlersFor = (items: AdminVisitorMessage[], overrides: { update?: MockResolver; list?: MockResolver } = {}): Record<string, MockRoute> => ({
  list: http.get('/v1/admin/visitor-messages', overrides.list ?? listResolver(items)),
  update: http.patch('/v1/admin/visitor-messages/:id', overrides.update ?? updateResolver(items)),
});

// Puts the preview's own MemoryRouter at the screen's route and query, which
// the filter reads and writes. A fixed `Routes location` could not follow the
// filter once a button changes it.
const StoryRoute = ({ search, children }: { search: string; children: ReactNode }): ReactNode => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate({ pathname: '/admin/messages', search }, { replace: true });
  }, [navigate, search]);

  return location.pathname === '/admin/messages' ? children : null;
};

// The query string the story opens at comes from its own parameters, so a
// story states its filter without stacking a second decorator on the meta's.
const withRoute: Decorator = (Story, { parameters }) => (
  <StoryRoute search={typeof parameters.messagesSearch === 'string' ? parameters.messagesSearch : ''}>
    <Story />
  </StoryRoute>
);

const meta: Meta<typeof MessagesListPage> = {
  title: 'AdminPanel/MessagesListPage',
  component: MessagesListPage,
  parameters: { layout: 'fullscreen', apiMocks: { handlers: handlersFor(mixedMessages) } },
  decorators: [withRoute, panelShellDecorator],
  beforeEach: () => {
    patchBodies.length = 0;
    requestedCursors.length = 0;
  },
};

export default meta;
type Story = StoryObj<typeof MessagesListPage>;

const findCards = (canvasElement: HTMLElement): Promise<HTMLElement[]> => within(canvasElement).findAllByRole('article');

export const Loading: Story = {
  parameters: { apiMocks: { handlers: { list: http.get('/v1/admin/visitor-messages', loadingResolver) } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByLabelText(consts.LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const Error: Story = {
  parameters: { apiMocks: { handlers: { list: http.get('/v1/admin/visitor-messages', errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.findByRole('button', { name: consts.RETRY_LABEL })).resolves.toBeInTheDocument();
  },
};

export const EmptyAll: Story = {
  parameters: { apiMocks: { handlers: handlersFor([]) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.NO_MESSAGES_HEADLINE)).resolves.toBeInTheDocument();
    // Nothing is waiting and nothing exists, so there is no way out to offer.
    await expect(canvasElement.querySelector('.showAll')).toBeNull();
  },
};

// Messages exist, all handled: the unhandled queue is empty, and its one
// button switches to the full list.
export const EmptyUnhandled: Story = {
  parameters: { apiMocks: { handlers: handlersFor([handled({ id: 'message-4' }), handled({ id: 'message-5', name: 'יוסף מזרחי' })]) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.NO_UNHANDLED_MESSAGES_HEADLINE)).resolves.toBeInTheDocument();

    const showAll = canvasElement.querySelector<HTMLButtonElement>('.showAll');
    if (!showAll) throw new globalThis.Error('MessagesListPage story: the empty state has no show-all button');
    await userEvent.click(showAll);

    await expect(canvas.findByText('רחל אברמוביץ')).resolves.toBeInTheDocument();
    await expect(canvas.findByRole('button', { name: consts.FILTER_LABELS.all, pressed: true })).resolves.toBeInTheDocument();
  },
};

export const EmptyHandled: Story = {
  parameters: { messagesSearch: '?status=handled', apiMocks: { handlers: handlersFor([unhandled({ id: 'message-1' })]) } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByText(consts.NO_HANDLED_MESSAGES_HEADLINE)).resolves.toBeInTheDocument();
  },
};

// Both types, both statuses on the "all" filter, a 1000-character message,
// an 80-character unbroken name and a Latin name.
export const Populated: Story = {
  parameters: { messagesSearch: '?status=all' },
  play: async ({ canvasElement }) => {
    const cards = await findCards(canvasElement);
    await expect(cards).toHaveLength(mixedMessages.length);

    const longCard = cards[2];
    if (!longCard) throw new globalThis.Error('MessagesListPage story: the long-content card is missing');
    await expect(longCard.scrollWidth).toBeLessThanOrEqual(longCard.clientWidth);
  },
};

// The default view is the unhandled queue: the URL carries no `status`, and
// the request carries `status=unhandled`.
export const DefaultsToUnhandled: Story = {
  play: async ({ canvasElement }) => {
    const cards = await findCards(canvasElement);
    await expect(cards).toHaveLength(3);
    await expect(within(canvasElement).getByRole('button', { name: consts.FILTER_LABELS.unhandled, pressed: true })).toBeInTheDocument();
  },
};

// The card stays in place, handled, with an undo, under the filter it was
// just handled out of.
export const MarkHandled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstCard] = await findCards(canvasElement);
    if (!firstCard) throw new globalThis.Error('MessagesListPage story: no cards rendered');
    const cardCount = canvas.getAllByRole('article').length;

    await userEvent.click(within(firstCard).getByRole('button', { name: cardConsts.MARK_HANDLED_LABEL }));

    await expect(within(firstCard).findByRole('button', { name: cardConsts.UNDO_HANDLED_LABEL })).resolves.toBeInTheDocument();
    await expect(within(firstCard).getByText(cardConsts.STATUS_HANDLED_LABEL)).toBeInTheDocument();
    await expect(canvas.getAllByRole('article')).toHaveLength(cardCount);
    await expect(patchBodies).toEqual([{ handled: true }]);
  },
};

export const PendingToggle: Story = {
  parameters: { apiMocks: { handlers: { update: http.patch('/v1/admin/visitor-messages/:id', loadingResolver) } } },
  play: async ({ canvasElement }) => {
    const [firstCard] = await findCards(canvasElement);
    if (!firstCard) throw new globalThis.Error('MessagesListPage story: no cards rendered');
    const toggle = within(firstCard).getByRole('button', { name: cardConsts.MARK_HANDLED_LABEL });

    await userEvent.click(toggle);

    await waitFor(() => expect(toggle).toBeDisabled());
    await expect(toggle).toHaveAttribute('aria-busy', 'true');
  },
};

export const ToggleFailed: Story = {
  parameters: { apiMocks: { handlers: { update: http.patch('/v1/admin/visitor-messages/:id', errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const [firstCard] = await findCards(canvasElement);
    if (!firstCard) throw new globalThis.Error('MessagesListPage story: no cards rendered');

    await userEvent.click(within(firstCard).getByRole('button', { name: cardConsts.MARK_HANDLED_LABEL }));

    await expect(within(firstCard).findByRole('alert')).resolves.toBeInTheDocument();
    await expect(within(firstCard).getByRole('button', { name: cardConsts.MARK_HANDLED_LABEL })).toBeEnabled();
  },
};

export const Undo: Story = {
  parameters: { messagesSearch: '?status=handled' },
  play: async ({ canvasElement }) => {
    const [firstCard] = await findCards(canvasElement);
    if (!firstCard) throw new globalThis.Error('MessagesListPage story: no cards rendered');

    await userEvent.click(within(firstCard).getByRole('button', { name: cardConsts.UNDO_HANDLED_LABEL }));

    await expect(within(firstCard).findByRole('button', { name: cardConsts.MARK_HANDLED_LABEL })).resolves.toBeInTheDocument();
    await expect(within(firstCard).getByText(cardConsts.STATUS_UNHANDLED_LABEL)).toBeInTheDocument();
    await expect(patchBodies).toEqual([{ handled: false }]);
  },
};

// The server's page holds two of the three messages and hands back a cursor:
// "load more" sends exactly that cursor back as `before`, fetches the older
// page, and the button goes away once the server says nothing older remains.
export const LoadMore: Story = {
  parameters: {
    apiMocks: {
      handlers: handlersFor(mixedMessages, {
        list: listResolver(
          mixedMessages.filter((item) => item.status === 'unhandled'),
          { pageSize: PAGE_SIZE_FOR_LOAD_MORE },
        ),
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unhandledMessages = mixedMessages.filter((item) => item.status === 'unhandled');
    await expect(findCards(canvasElement)).resolves.toHaveLength(PAGE_SIZE_FOR_LOAD_MORE);
    await expect(requestedCursors).toEqual([null]);

    await userEvent.click(canvas.getByRole('button', { name: consts.LOAD_MORE_LABEL }));

    await waitFor(() => expect(canvas.getAllByRole('article')).toHaveLength(unhandledMessages.length));
    // The second request carries the first response's `nextCursor`, the last
    // card of the first page.
    const lastOfFirstPage = unhandledMessages[PAGE_SIZE_FOR_LOAD_MORE - 1];
    if (!lastOfFirstPage) throw new globalThis.Error('MessagesListPage story: the fixture has no second page');
    await expect(requestedCursors).toEqual([null, cursorFor(lastOfFirstPage)]);
    await expect(canvas.queryByRole('button', { name: consts.LOAD_MORE_LABEL })).toBeNull();
  },
};

const singleMessage = (message: AdminVisitorMessage): Pick<Story, 'parameters'> => ({
  parameters: { apiMocks: { handlers: handlersFor([message]) } },
});

export const NoteEmpty: Story = {
  ...singleMessage(unhandled({ id: 'message-1' })),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).findByRole('button', { name: noteConsts.ADD_NOTE_LABEL })).resolves.toBeInTheDocument();
  },
};

// A long multi-line note, and then a Latin one, each on its own card.
export const NoteFilled: Story = {
  parameters: {
    messagesSearch: '?status=handled',
    apiMocks: {
      handlers: handlersFor([
        handled({ id: 'message-4', handlingNote: LONG_NOTE }),
        handled({ id: 'message-5', name: 'Moshe Katz', handlingNote: 'Called the gabbai, lessons added on Sunday and Tuesday.' }),
      ]),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(/התקשרנו|שוחחנו עם הגבאי/)).resolves.toBeInTheDocument();
    await expect(canvas.getAllByRole('button', { name: noteConsts.EDIT_NOTE_LABEL })).toHaveLength(2);
  },
};

const openNoteEditor = async (canvasElement: HTMLElement, triggerName: string): Promise<HTMLTextAreaElement> => {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole('button', { name: triggerName }));
  return (await canvas.findByRole('textbox', { name: noteConsts.NOTE_LABEL })) as HTMLTextAreaElement;
};

export const NoteEditing: Story = {
  ...singleMessage(unhandled({ id: 'message-1' })),
  play: async ({ canvasElement }) => {
    const field = await openNoteEditor(canvasElement, noteConsts.ADD_NOTE_LABEL);
    await expect(field).toHaveFocus();
    await expect(field).toHaveAttribute('maxlength', String(noteConsts.NOTE_MAX_LENGTH));
  },
};

export const NoteSaving: Story = {
  parameters: { apiMocks: { handlers: { ...handlersFor([unhandled({ id: 'message-1' })]), update: http.patch('/v1/admin/visitor-messages/:id', loadingResolver) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await openNoteEditor(canvasElement, noteConsts.ADD_NOTE_LABEL);
    await userEvent.type(field, 'שוחחנו עם הגבאי');
    await userEvent.click(canvas.getByRole('button', { name: noteConsts.SAVE_LABEL }));

    await expect(canvas.findByRole('button', { name: noteConsts.SAVING_LABEL })).resolves.toBeDisabled();
    await expect(field).toHaveAttribute('readonly');
  },
};

export const NoteSaveFailed: Story = {
  parameters: { apiMocks: { handlers: { ...handlersFor([unhandled({ id: 'message-1' })]), update: http.patch('/v1/admin/visitor-messages/:id', failingUpdateResolver) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await openNoteEditor(canvasElement, noteConsts.ADD_NOTE_LABEL);
    await userEvent.type(field, 'שוחחנו עם הגבאי');
    await userEvent.click(canvas.getByRole('button', { name: noteConsts.SAVE_LABEL }));

    await expect(canvas.findByText(noteConsts.SAVE_FAILURE_MESSAGE)).resolves.toBeInTheDocument();
    await expect(field).toHaveValue('שוחחנו עם הגבאי');
    await expect(patchBodies).toEqual([{ handlingNote: 'שוחחנו עם הגבאי' }]);
  },
};

export const NoteSaved: Story = {
  ...singleMessage(unhandled({ id: 'message-1' })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await openNoteEditor(canvasElement, noteConsts.ADD_NOTE_LABEL);
    await userEvent.type(field, 'שוחחנו עם הגבאי');
    await userEvent.click(canvas.getByRole('button', { name: noteConsts.SAVE_LABEL }));

    await expect(canvas.findByText('שוחחנו עם הגבאי')).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: noteConsts.EDIT_NOTE_LABEL })).toHaveFocus();
    // A note save writes only the note, so it never touches the handled state.
    await expect(patchBodies).toEqual([{ handlingNote: 'שוחחנו עם הגבאי' }]);
    await expect(canvas.getByText(cardConsts.STATUS_UNHANDLED_LABEL)).toBeInTheDocument();
  },
};

export const NoteCleared: Story = {
  parameters: { messagesSearch: '?status=handled', apiMocks: { handlers: handlersFor([handled({ id: 'message-4', handlingNote: LONG_NOTE })]) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await openNoteEditor(canvasElement, noteConsts.EDIT_NOTE_LABEL);
    await userEvent.clear(field);
    await userEvent.click(canvas.getByRole('button', { name: noteConsts.SAVE_LABEL }));

    await expect(canvas.findByRole('button', { name: noteConsts.ADD_NOTE_LABEL })).resolves.toBeInTheDocument();
    await expect(patchBodies).toEqual([{ handlingNote: '' }]);
  },
};
