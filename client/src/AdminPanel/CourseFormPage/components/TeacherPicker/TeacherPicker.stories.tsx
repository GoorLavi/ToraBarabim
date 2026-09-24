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

export const RabbiSelected: Story = {
  args: { teacher: { kind: 'rabbi', rabbi: avraham } },
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
// קישור לרב" wording, pass 2 brief): the picker opens straight into the
// free-text mode, pre-filled, never a search box with nothing selected.
export const NamedFallback: Story = {
  args: { teacher: { kind: 'named', name: 'הרב פלוני אלמוני' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(consts.NAMED_LABEL) as HTMLInputElement;
    await expect(input.value).toEqual('הרב פלוני אלמוני');
    await expect(canvas.getByText(consts.NAMED_HELP)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: consts.SEARCH_PLACEHOLDER })).not.toBeInTheDocument();
  },
};

// Switching away from a chosen rabbi, toward a free-text name: the toggle
// itself never carries the previous rabbi forward into `name`.
export const SwitchingToNamedMode: Story = {
  args: { teacher: { kind: 'rabbi', rabbi: avraham } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: consts.NAMED_MODE_LABEL }));
    await expect(canvas.findByLabelText(consts.NAMED_LABEL)).resolves.toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText(consts.NAMED_LABEL), 'א');
    await expect(args.onChangeTeacher).toHaveBeenCalledWith({ kind: 'named', name: 'א' });
  },
};

export const WithFieldError: Story = {
  args: { teacher: { kind: 'named', name: '' }, errorMessage: 'יש לבחור מי מלמד את הקורס' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('יש לבחור מי מלמד את הקורס')).resolves.toBeInTheDocument();
  },
};
