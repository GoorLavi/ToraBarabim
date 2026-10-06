import type { CreateVisitorMessageRequest } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import * as formConsts from '~/components/HelpWindow/components/VisitorMessageForm/consts';
import * as windowConsts from '~/components/HelpWindow/consts';

import { http, respondWithJson } from '../../../.storybook/apiMocks';
import * as consts from './consts';
import { ReportMistake } from './ReportMistake';

const LESSON_CONTEXT_LINES = ['עיונים בפרשת השבוע עם הרב יעקב מזרחי', 'יום שלישי, 13 באוקטובר, בשעה 20:30', 'בית הכנסת המרכזי, נתניה'];

const meta: Meta<typeof ReportMistake> = {
  title: 'components/ReportMistake',
  component: ReportMistake,
  args: { subject: { kind: 'lesson', lessonId: 'lesson-1', date: '2026-10-13' }, contextLines: LESSON_CONTEXT_LINES },
};

export default meta;
type Story = StoryObj<typeof ReportMistake>;

const postedBodies: CreateVisitorMessageRequest[] = [];

const recordingHandler = (respond: () => Response) => ({
  send: http.post('/v1/visitor-messages', async ({ request }) => {
    postedBodies.push((await request.json()) as CreateVisitorMessageRequest);
    return respond();
  }),
});

const triggerOf = (canvasElement: HTMLElement): HTMLElement => within(canvasElement).getByRole('button', { name: new RegExp(consts.REPORT_PROMPT_ACTION) });
const windowOf = (): Promise<HTMLElement> => within(document.body).findByRole('dialog', { name: consts.REPORT_WINDOW_TITLE });

const fillForm = async (dialog: HTMLElement): Promise<void> => {
  await userEvent.type(within(dialog).getByRole('textbox', { name: formConsts.FIELD_LABELS.name }), 'דוד כהן');
  await userEvent.type(within(dialog).getByRole('textbox', { name: formConsts.FIELD_LABELS.phone }), '052-123-4567');
  await userEvent.type(within(dialog).getByRole('textbox', { name: formConsts.FIELD_LABELS.message }), 'השעה השתנתה לשמונה.');
};

export const ButtonAlone: Story = {
  play: async ({ canvasElement }) => {
    await expect(triggerOf(canvasElement)).toHaveTextContent(`${consts.REPORT_PROMPT_LEAD} ${consts.REPORT_PROMPT_ACTION}`);
    // A 48px target, the whole line.
    await expect(triggerOf(canvasElement).getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    await expect(within(document.body).queryByRole('dialog')).toBeNull();
  },
};

export const WindowOpen: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(triggerOf(canvasElement));
    const dialog = await windowOf();
    await expect(within(dialog).getByText(consts.REPORT_CONTEXT_LABELS.lesson)).toBeInTheDocument();
    for (const line of LESSON_CONTEXT_LINES) await expect(within(dialog).getByText(line)).toBeInTheDocument();
  },
};

export const SendsALessonReport: Story = {
  parameters: { apiMocks: { handlers: recordingHandler(() => new Response(null, { status: 204 })) } },
  play: async ({ canvasElement }) => {
    postedBodies.length = 0;
    await userEvent.click(triggerOf(canvasElement));
    const dialog = await windowOf();
    await fillForm(dialog);
    await userEvent.click(within(dialog).getByRole('button', { name: formConsts.SUBMIT_LABEL }));

    await within(dialog).findByRole('heading', { name: windowConsts.THANK_YOU_MESSAGE });
    await expect(postedBodies).toEqual([
      { type: 'report-mistake', subject: { kind: 'lesson', lessonId: 'lesson-1', date: '2026-10-13' }, name: 'דוד כהן', phone: '052-123-4567', message: 'השעה השתנתה לשמונה.' },
    ]);
  },
};

export const SendsAPlaceReport: Story = {
  args: { subject: { kind: 'place', placeId: 'place-1' }, contextLines: ['בית הכנסת המרכזי', 'רחוב ויצמן 45, נתניה'] },
  parameters: { apiMocks: { handlers: recordingHandler(() => new Response(null, { status: 204 })) } },
  play: async ({ canvasElement }) => {
    postedBodies.length = 0;
    await userEvent.click(triggerOf(canvasElement));
    const dialog = await windowOf();
    await expect(within(dialog).getByText(consts.REPORT_CONTEXT_LABELS.place)).toBeInTheDocument();
    await expect(within(dialog).getByPlaceholderText(consts.REPORT_MESSAGE_PLACEHOLDERS.place)).toBeInTheDocument();
    await fillForm(dialog);
    await userEvent.click(within(dialog).getByRole('button', { name: formConsts.SUBMIT_LABEL }));

    await within(dialog).findByRole('heading', { name: windowConsts.THANK_YOU_MESSAGE });
    await expect(postedBodies).toEqual([{ type: 'report-mistake', subject: { kind: 'place', placeId: 'place-1' }, name: 'דוד כהן', phone: '052-123-4567', message: 'השעה השתנתה לשמונה.' }]);
  },
};

// A failed send keeps what was typed, shows the failure, and closing returns
// focus to the button that opened the window.
export const FailureKeepsTheDraftAndFocusReturns: Story = {
  parameters: { apiMocks: { handlers: recordingHandler(() => respondWithJson({ error: 'internal_error', message: 'שגיאה' }, 500)) } },
  play: async ({ canvasElement }) => {
    await userEvent.click(triggerOf(canvasElement));
    const dialog = await windowOf();
    await fillForm(dialog);
    await userEvent.click(within(dialog).getByRole('button', { name: formConsts.SUBMIT_LABEL }));
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(formConsts.SEND_FAILURE_MESSAGE);

    await userEvent.click(within(dialog).getAllByRole('button', { name: windowConsts.CLOSE_LABEL })[0] as HTMLElement);
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await expect(triggerOf(canvasElement)).toHaveFocus();

    await userEvent.click(triggerOf(canvasElement));
    const reopened = await windowOf();
    await expect(within(reopened).queryByRole('alert')).toBeNull();
    await expect(within(reopened).getByRole('textbox', { name: formConsts.FIELD_LABELS.name })).toHaveValue('דוד כהן');
  },
};
