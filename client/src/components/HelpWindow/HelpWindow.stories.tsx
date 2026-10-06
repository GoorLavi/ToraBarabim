import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within } from 'storybook/test';

import { ReportContext } from '~/components/ReportMistake/components/ReportContext/ReportContext';
import * as reportConsts from '~/components/ReportMistake/consts';

import * as formConsts from './components/VisitorMessageForm/consts';
import * as consts from './consts';
import { HelpWindow } from './HelpWindow';
import type { HelpWindowProps, VisitorMessageDraft } from './models';

const LESSON_CONTEXT_LINES = ['עיונים בפרשת השבוע עם הרב יעקב מזרחי', 'יום שלישי, 13 באוקטובר, בשעה 20:30', 'בית הכנסת המרכזי, נתניה'];
const PLACE_CONTEXT_LINES = ['בית הכנסת המרכזי', 'רחוב ויצמן 45, נתניה'];

const FILLED_DRAFT: VisitorMessageDraft = { name: 'דוד כהן', phone: '052-123-4567', message: 'השיעור עבר לבית הכנסת ברחוב הרצל.' };

// The window holds no state, so the story gives it the draft a page would.
const StatefulHelpWindow = (props: HelpWindowProps) => {
  const [draft, setDraft] = useState(props.draft);
  return <HelpWindow {...props} draft={draft} onDraftChange={setDraft} />;
};

const meta: Meta<typeof HelpWindow> = {
  title: 'components/HelpWindow',
  component: HelpWindow,
  render: (args) => <StatefulHelpWindow {...args} />,
  args: {
    title: reportConsts.REPORT_WINDOW_TITLE,
    paragraphs: reportConsts.REPORT_WINDOW_PARAGRAPHS,
    messagePlaceholder: reportConsts.REPORT_MESSAGE_PLACEHOLDERS.lesson,
    draft: consts.EMPTY_VISITOR_MESSAGE_DRAFT,
    status: 'idle',
  },
};

export default meta;
type Story = StoryObj<typeof HelpWindow>;

const dialog = (): Promise<HTMLElement> => within(document.body).findByRole('dialog', { name: reportConsts.REPORT_WINDOW_TITLE });

export const ReportWithLessonContext: Story = {
  args: { context: <ReportContext label={reportConsts.REPORT_CONTEXT_LABELS.lesson} lines={LESSON_CONTEXT_LINES} /> },
  play: async () => {
    const window = await dialog();
    await expect(within(window).getByText(reportConsts.REPORT_CONTEXT_LABELS.lesson)).toBeInTheDocument();
    for (const line of LESSON_CONTEXT_LINES) await expect(within(window).getByText(line)).toBeInTheDocument();
    await expect(within(window).getByPlaceholderText(reportConsts.REPORT_MESSAGE_PLACEHOLDERS.lesson)).toBeInTheDocument();
  },
};

export const ReportWithPlaceContext: Story = {
  args: {
    messagePlaceholder: reportConsts.REPORT_MESSAGE_PLACEHOLDERS.place,
    context: <ReportContext label={reportConsts.REPORT_CONTEXT_LABELS.place} lines={PLACE_CONTEXT_LINES} />,
  },
  play: async () => {
    const window = await dialog();
    await expect(within(window).getByText(reportConsts.REPORT_CONTEXT_LABELS.place)).toBeInTheDocument();
    await expect(within(window).getByPlaceholderText(reportConsts.REPORT_MESSAGE_PLACEHOLDERS.place)).toBeInTheDocument();
  },
};

// A window with no context: the home tiles' shape.
export const WithoutContext: Story = {
  play: async () => {
    const window = await dialog();
    await expect(within(window).queryByText(reportConsts.REPORT_CONTEXT_LABELS.lesson)).toBeNull();
  },
};

export const Sending: Story = {
  args: { draft: FILLED_DRAFT, status: 'sending', context: <ReportContext label={reportConsts.REPORT_CONTEXT_LABELS.lesson} lines={LESSON_CONTEXT_LINES} /> },
  play: async () => {
    const window = await dialog();
    await expect(within(window).getByRole('button', { name: formConsts.SUBMIT_SENDING_LABEL })).toBeInTheDocument();
  },
};

export const Sent: Story = {
  args: { draft: FILLED_DRAFT, status: 'sent' },
  play: async () => {
    const window = await dialog();
    await expect(await within(window).findByRole('heading', { name: consts.THANK_YOU_MESSAGE })).toBeInTheDocument();
  },
};

export const Failed: Story = {
  args: { draft: FILLED_DRAFT, status: 'failed', context: <ReportContext label={reportConsts.REPORT_CONTEXT_LABELS.lesson} lines={LESSON_CONTEXT_LINES} /> },
  play: async () => {
    const window = await dialog();
    await expect(within(window).getByRole('alert')).toHaveTextContent(formConsts.SEND_FAILURE_MESSAGE);
    await expect(within(window).getByDisplayValue(FILLED_DRAFT.name)).toBeInTheDocument();
  },
};

// Long names wrap inside the context block rather than overflowing it.
export const LongContextOnNarrowPhone: Story = {
  globals: { viewport: { value: 'narrow', isRotated: false } },
  parameters: { viewport: { options: { narrow: { name: 'Narrow 320', styles: { width: '320px', height: '100%' }, type: 'mobile' } } } },
  args: {
    context: (
      <ReportContext
        label={reportConsts.REPORT_CONTEXT_LABELS.lesson}
        lines={['שיעור מיוחד לכבוד ראש חודש עם הרב פרופסור יהודה אריה לייב הכהן שוורצנברג-אייזנשטיין', 'יום רביעי, 30 בספטמבר, בשעה 06:00', 'בית הכנסת הגדול "היכל התורה והתפילה", קריית מלאכי והמושבים הסמוכים לה בעוטף עזה']}
      />
    ),
  },
  play: async () => {
    const window = await dialog();
    await expect(window.scrollWidth).toBeLessThanOrEqual(window.clientWidth);
  },
};
