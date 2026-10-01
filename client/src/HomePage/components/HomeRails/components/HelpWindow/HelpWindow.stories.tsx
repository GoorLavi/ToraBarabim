import type { CreateVisitorMessageRequest, HomeResponse, LessonOccurrence, VisitorMessageType } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { VISITOR_MESSAGE_TITLES } from '~/HomePage/consts';
import { rabbiFixture } from '~/rabbiFixture';
import { atFrameSize } from '~/storyMocks';

import { http, loadingResolver, respondWithJson } from '../../../../../../.storybook/apiMocks';
import { HomeRails } from '../../HomeRails';
import type { HomeRowsQueryState } from '../../models';
import * as formConsts from './components/VisitorMessageForm/consts';
import * as consts from './consts';
import { HelpWindow } from './HelpWindow';

const lesson = (id: string): LessonOccurrence => ({
  lessonId: id,
  date: '2026-10-05',
  startTime: '20:00',
  endTime: '21:00',
  status: 'scheduled',
  title: 'עיונים בפרשת השבוע',
  topic: 'parasha',
  audience: 'mixed',
  rabbi: rabbiFixture({ id: `rabbi-${id}`, name: 'יעקב מזרחי' }),
  venue: { kind: 'address', name: 'בית הכנסת המרכזי', street: 'רחוב ויצמן 45', city: 'נתניה', citySlug: 'נתניה', area: 'sharon' },
});

const HELP_TILE_INDEX = 2;

// The window is opened by pressing its tile, the way a visitor opens it, so
// each story renders the rails around one tile rather than the window alone:
// the draft, the send state and the focus return all live in `HomeRails`.
const stageQuery = (kind: VisitorMessageType): HomeRowsQueryState => {
  const data: HomeResponse = {
    rows: [
      {
        kind: 'lessons',
        id: 'today',
        title: 'הערב',
        items: [lesson('a'), lesson('b'), lesson('c'), lesson('d')],
        helpTile: { kind, index: HELP_TILE_INDEX },
      },
    ],
    womensAreaLessonCount: 0,
    rabbis: [],
    dedications: [],
  };
  return { isPending: false, isError: false, data, error: null, refetch: () => {} };
};

const meta: Meta<typeof HelpWindow> = {
  title: 'HomePage/HomeRails/HelpWindow',
  component: HelpWindow,
  render: (_args, { parameters }) => <HomeRails query={stageQuery(parameters.kind as VisitorMessageType)} dedicationGroup={undefined} />,
};

export default meta;
type Story = StoryObj<typeof HelpWindow>;

// Every POST the story's own handler received, so a `play` can assert what
// was sent and that a refused submit sent nothing.
const postedBodies: CreateVisitorMessageRequest[] = [];

const recordingResolver = (respond: () => Response) => async ({ request }: { request: Request }) => {
  postedBodies.push((await request.json()) as CreateVisitorMessageRequest);
  return respond();
};

const storedResolver = recordingResolver(() => new Response(null, { status: 204 }));
const failingResolver = recordingResolver(() => respondWithJson({ error: 'internal_error', message: 'שגיאה' }, 500));

const postHandler = (resolver: ReturnType<typeof recordingResolver> | typeof loadingResolver = storedResolver) => ({
  send: http.post('/v1/visitor-messages', resolver),
});

const VALID_NAME = 'דוד כהן';
const VALID_PHONE = '052-123-4567';
const VALID_MESSAGE = 'הרב משה לוי מוסר שיעור בדף היומי בבית הכנסת "אוהל יעקב" בחיפה.';

const openWindow = async (canvasElement: HTMLElement, kind: VisitorMessageType): Promise<HTMLElement> => {
  const tile = await within(canvasElement).findByRole('button', { name: new RegExp(`^${VISITOR_MESSAGE_TITLES[kind]}`) });
  await userEvent.click(tile);
  return within(document.body).findByRole('dialog', { name: VISITOR_MESSAGE_TITLES[kind] });
};

const field = (dialog: HTMLElement, name: string): HTMLInputElement | HTMLTextAreaElement =>
  within(dialog).getByRole('textbox', { name }) as HTMLInputElement | HTMLTextAreaElement;

const fillValidForm = async (dialog: HTMLElement): Promise<void> => {
  await userEvent.type(field(dialog, formConsts.FIELD_LABELS.name), VALID_NAME);
  await userEvent.type(field(dialog, formConsts.FIELD_LABELS.phone), VALID_PHONE);
  await userEvent.type(field(dialog, formConsts.FIELD_LABELS.message), VALID_MESSAGE);
};

const submit = (dialog: HTMLElement): Promise<void> =>
  userEvent.click(within(dialog).getByRole('button', { name: new RegExp(`^(${formConsts.SUBMIT_LABEL}|${formConsts.SUBMIT_SENDING_LABEL})$`) }));

// Words that would make a promise or mention money: the window carries
// neither, anywhere.
const FORBIDDEN_COPY = /נחזור|ניצור קשר|נפנה|ניצור איתך|₪|עלות|מחיר|תשלום|ש"ח/;

const idleStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler() } },
  play: async ({ canvasElement }) => {
    const dialog = await openWindow(canvasElement, kind);
    const copy = consts.HELP_WINDOW_COPY[kind];

    for (const paragraph of copy.paragraphs) await expect(within(dialog).getByText(paragraph)).toBeInTheDocument();
    await expect(within(dialog).getByPlaceholderText(copy.messagePlaceholder)).toBeInTheDocument();
    // Focus lands on the title, never on a field: a field would raise the
    // phone keyboard before anything has been read.
    await expect(within(dialog).getByRole('heading', { name: VISITOR_MESSAGE_TITLES[kind] })).toHaveFocus();
    await expect(dialog.textContent).not.toMatch(FORBIDDEN_COPY);
  },
});

const validationStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler() } },
  play: async ({ canvasElement }) => {
    postedBodies.length = 0;
    const dialog = await openWindow(canvasElement, kind);

    await submit(dialog);
    for (const message of Object.values(formConsts.FIELD_ERRORS)) await expect(within(dialog).findByText(message)).resolves.toBeInTheDocument();
    await expect(field(dialog, formConsts.FIELD_LABELS.name)).toHaveFocus();
    await expect(postedBodies).toHaveLength(0);

    // Fixing a flagged field clears its own message as it is edited; a
    // landline is then the only thing left to say.
    await userEvent.type(field(dialog, formConsts.FIELD_LABELS.name), VALID_NAME);
    await userEvent.type(field(dialog, formConsts.FIELD_LABELS.message), VALID_MESSAGE);
    await userEvent.type(field(dialog, formConsts.FIELD_LABELS.phone), '03-1234567');
    await submit(dialog);

    await expect(within(dialog).findByText(formConsts.FIELD_ERRORS.phone)).resolves.toBeInTheDocument();
    await expect(within(dialog).queryByText(formConsts.FIELD_ERRORS.name)).toBeNull();
    await expect(within(dialog).queryByText(formConsts.FIELD_ERRORS.message)).toBeNull();
    await expect(field(dialog, formConsts.FIELD_LABELS.phone)).toHaveFocus();
    await expect(field(dialog, formConsts.FIELD_LABELS.phone)).toHaveAttribute('aria-invalid', 'true');
    await expect(postedBodies).toHaveLength(0);
  },
});

const sendingStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler(loadingResolver) } },
  play: async ({ canvasElement }) => {
    const dialog = await openWindow(canvasElement, kind);
    await fillValidForm(dialog);

    await userEvent.dblClick(within(dialog).getByRole('button', { name: formConsts.SUBMIT_LABEL }));

    const form = dialog.querySelector('form');
    await waitFor(() => expect(form).toHaveAttribute('aria-busy', 'true'));
    await expect(within(dialog).getByRole('button', { name: formConsts.SUBMIT_SENDING_LABEL })).toBeInTheDocument();
    for (const label of Object.values(formConsts.FIELD_LABELS)) await expect(field(dialog, label)).toHaveAttribute('readonly');
  },
});

const successStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler() } },
  play: async ({ canvasElement }) => {
    postedBodies.length = 0;
    const dialog = await openWindow(canvasElement, kind);
    await fillValidForm(dialog);

    await submit(dialog);

    const thankYou = await within(dialog).findByRole('heading', { name: consts.THANK_YOU_MESSAGE });
    await expect(thankYou).toHaveFocus();
    await expect(dialog.querySelector('form')).toBeNull();
    // The type is the opening tile's, and the phone goes as typed: the server
    // normalises it.
    await expect(postedBodies).toEqual([{ type: kind, name: VALID_NAME, phone: VALID_PHONE, message: VALID_MESSAGE }]);
    await expect(dialog.textContent).not.toMatch(FORBIDDEN_COPY);

  },
});

// A sent message ends its draft: closing the thank-you and reopening the same
// tile starts clean, never with the sent text still in the fields.
const reopensEmptyStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler() } },
  play: async ({ canvasElement }) => {
    const dialog = await openWindow(canvasElement, kind);
    await fillValidForm(dialog);
    await submit(dialog);
    await within(dialog).findByRole('heading', { name: consts.THANK_YOU_MESSAGE });

    await userEvent.click(dialog.querySelector<HTMLButtonElement>('.done') as HTMLButtonElement);
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());

    const reopened = await openWindow(canvasElement, kind);
    await expect(field(reopened, formConsts.FIELD_LABELS.name)).toHaveValue('');
    await expect(field(reopened, formConsts.FIELD_LABELS.phone)).toHaveValue('');
    await expect(field(reopened, formConsts.FIELD_LABELS.message)).toHaveValue('');
  },
});

const failureStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler(failingResolver) } },
  play: async ({ canvasElement }) => {
    const dialog = await openWindow(canvasElement, kind);
    await fillValidForm(dialog);

    await submit(dialog);

    await expect(within(dialog).findByRole('alert')).resolves.toHaveTextContent(formConsts.SEND_FAILURE_MESSAGE);
    // Nothing typed is lost, and the visitor can press again.
    await expect(field(dialog, formConsts.FIELD_LABELS.name)).toHaveValue(VALID_NAME);
    await expect(field(dialog, formConsts.FIELD_LABELS.phone)).toHaveValue(VALID_PHONE);
    await expect(field(dialog, formConsts.FIELD_LABELS.message)).toHaveValue(VALID_MESSAGE);
    await expect(within(dialog).getByRole('button', { name: formConsts.SUBMIT_LABEL })).toBeEnabled();
  },
});

export const RabbiRequestIdle: Story = idleStory('rabbi-request');
export const RabbiRequestValidationErrors: Story = validationStory('rabbi-request');
export const RabbiRequestSending: Story = sendingStory('rabbi-request');
export const RabbiRequestSuccess: Story = successStory('rabbi-request');
export const RabbiRequestFailure: Story = failureStory('rabbi-request');
export const RabbiRequestReopensEmptyAfterSuccess: Story = reopensEmptyStory('rabbi-request');

export const VolunteerIdle: Story = idleStory('volunteer');
export const VolunteerValidationErrors: Story = validationStory('volunteer');
export const VolunteerSending: Story = sendingStory('volunteer');
export const VolunteerSuccess: Story = successStory('volunteer');
export const VolunteerFailure: Story = failureStory('volunteer');
export const VolunteerReopensEmptyAfterSuccess: Story = reopensEmptyStory('volunteer');

// The smallest phone the site serves, with the keyboard-less height of an
// older device: the panel is one scroll region, so the submit button must be
// reachable by scrolling and the title must never run under the close button.
const phoneStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler() } },
  play: ({ canvasElement }) =>
    atFrameSize(320, 568, async () => {
      const dialog = await openWindow(canvasElement, kind);
      const submitButton = within(dialog).getByRole('button', { name: formConsts.SUBMIT_LABEL });

      // The phone sheet slides in over 160ms: measured only once it has landed.
      await waitFor(() => expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight + 1));
      submitButton.scrollIntoView({ block: 'nearest' });
      const panelRect = dialog.getBoundingClientRect();
      const buttonRect = submitButton.getBoundingClientRect();
      await expect(buttonRect.bottom).toBeLessThanOrEqual(panelRect.bottom + 1);
      await expect(panelRect.bottom).toBeLessThanOrEqual(window.innerHeight + 1);

      dialog.scrollTo({ top: 0 });
      const closeRect = within(dialog).getAllByRole('button', { name: consts.CLOSE_LABEL })[0]?.getBoundingClientRect();
      const titleRect = within(dialog).getByRole('heading', { name: VISITOR_MESSAGE_TITLES[kind] }).getBoundingClientRect();
      if (!closeRect) throw new Error('HelpWindow story: the close button is missing');
      // The two never overlap on the inline axis.
      await expect(titleRect.left >= closeRect.right || titleRect.right <= closeRect.left).toBe(true);
    }),
});

export const RabbiRequestPhone320: Story = phoneStory('rabbi-request');
export const VolunteerPhone320: Story = phoneStory('volunteer');

// Centred and fully rounded from `md` up, like the dedication window.
const desktopStory = (kind: VisitorMessageType): Story => ({
  parameters: { kind, apiMocks: { handlers: postHandler() } },
  play: ({ canvasElement }) =>
    atFrameSize(1280, 900, async () => {
      const dialog = await openWindow(canvasElement, kind);
      const rect = dialog.getBoundingClientRect();

      await expect(rect.bottom).toBeLessThan(window.innerHeight);
      await expect(Math.abs((rect.left + rect.right) / 2 - window.innerWidth / 2)).toBeLessThanOrEqual(1);
    }),
});

export const RabbiRequestDesktop: Story = desktopStory('rabbi-request');
export const VolunteerDesktop: Story = desktopStory('volunteer');
