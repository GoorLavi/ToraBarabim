import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { rabbiFixture } from '~/rabbiFixture';

import { http, jsonResolver } from '../../../../../.storybook/apiMocks';
import * as consts from './consts';
import { TeacherPicker } from './TeacherPicker';

const avraham = rabbiFixture({ id: 'rabbi-1', name: 'אברהם כהן' });
const moshe = rabbiFixture({ id: 'rabbi-2', name: 'משה לוי' });

const rabbisHandler = http.get('/v1/admin/rabbis', jsonResolver({ items: [avraham, moshe], page: 1, pageSize: 200, total: 2 }));

const meta: Meta<typeof TeacherPicker> = {
  title: 'AdminPanel/CourseFormPage/TeacherPicker',
  component: TeacherPicker,
  args: { onChangeTeacher: fn(), errorMessage: undefined },
  parameters: { apiMocks: { handlers: { rabbis: rabbisHandler } } },
};

export default meta;
type Story = StoryObj<typeof TeacherPicker>;

const openSearch = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: consts.SEARCH_PLACEHOLDER }));
  return canvas;
};

// Nothing chosen yet: the search trigger, the "או" divider, and the
// free-text field all visible at once, the same fork `PlacePicker` uses.
export const NothingChosen: Story = {
  args: { teacher: { kind: 'named', name: '' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(consts.OR_LABEL)).toBeInTheDocument();
    await expect(canvas.getByLabelText(consts.NAMED_LABEL)).toBeInTheDocument();
  },
};

export const SearchResults: Story = {
  args: { teacher: { kind: 'named', name: '' } },
  play: async ({ canvasElement }) => {
    const canvas = await openSearch(canvasElement);
    await expect(canvas.findByText('הרב אברהם כהן')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('הרב משה לוי')).resolves.toBeInTheDocument();
  },
};

// A course whose teacher carries no live rabbi link (the editor's own "אין
// קישור לרב" wording, pass 2 brief): the free-text field is pre-filled, the
// search and the divider stay in place beside it.
export const NamedFallback: Story = {
  args: { teacher: { kind: 'named', name: 'הרב פלוני אלמוני' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(consts.NAMED_LABEL) as HTMLInputElement;
    await expect(input.value).toEqual('הרב פלוני אלמוני');
    await expect(canvas.getByText(consts.NAMED_HELP)).toBeInTheDocument();
  },
};

// Selecting a rabbi locks the picker: the search and the divider disappear,
// replaced by the chosen name and a "ביטול הבחירה" way back to free text.
export const RabbiSelected: Story = {
  args: { teacher: { kind: 'rabbi', rabbi: avraham } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('הרב אברהם כהן')).toBeInTheDocument();
    await expect(canvas.queryByText(consts.OR_LABEL)).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText(consts.NAMED_LABEL)).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.CLEAR_SELECTION_LABEL })).toBeInTheDocument();
  },
};

export const ClearingSelectionReturnsToFreeText: Story = {
  args: { teacher: { kind: 'rabbi', rabbi: avraham } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: consts.CLEAR_SELECTION_LABEL }));
    await expect(args.onChangeTeacher).toHaveBeenCalledWith({ kind: 'named', name: '' });
  },
};

export const WithFieldError: Story = {
  args: { teacher: { kind: 'named', name: '' }, errorMessage: consts.REQUIRED_TEACHER_ERROR },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.REQUIRED_TEACHER_ERROR)).resolves.toBeInTheDocument();
  },
};
