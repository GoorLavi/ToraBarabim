import type { RabbiHonorific } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import * as parentConsts from '~/AdminPanel/RabbiFormPage/consts';
import { RABBI_HONORIFIC_LABELS } from '~/consts';

import { http, jsonResolver } from '../../../../../.storybook/apiMocks';
import { DeleteRabbiButton } from './DeleteRabbiButton';

const previewHandler = (preview: { lessonCount: number; exceptionCount: number; courseCount: number }) =>
  http.get('/v1/admin/rabbis/:id/delete-preview', jsonResolver(preview));

const meta: Meta<typeof DeleteRabbiButton> = {
  title: 'AdminPanel/RabbiFormPage/DeleteRabbiButton',
  component: DeleteRabbiButton,
  args: { rabbiId: 'rabbi-1', honorific: 'rav', onDeleted: fn() },
};

export default meta;
type Story = StoryObj<typeof DeleteRabbiButton>;

const openDialog = async (canvasElement: HTMLElement, honorific: RabbiHonorific = 'rav') => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: parentConsts.deleteLabel(RABBI_HONORIFIC_LABELS[honorific]) }));
  return within(document.body);
};

// A single non-zero part, itself singular: the closing verb is singular
// too ("קורס אחד המשויך אליו"), the one shape that differs from every
// other combination below.
export const SingleItemSingular: Story = {
  parameters: { apiMocks: { handlers: { preview: previewHandler({ lessonCount: 0, exceptionCount: 0, courseCount: 1 }) } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(dialog.findByText('מחיקת הרב תמחק גם קורס אחד המשויך אליו.')).resolves.toBeInTheDocument();
  },
};

// A single non-zero part, plural: no vav at all, since there is nothing
// else to join it to.
export const OnePartOnly: Story = {
  parameters: { apiMocks: { handlers: { preview: previewHandler({ lessonCount: 0, exceptionCount: 0, courseCount: 3 }) } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(dialog.findByText('מחיקת הרב תמחק גם 3 קורסים המשויכים אליו.')).resolves.toBeInTheDocument();
  },
};

// Two parts, the last starting with a digit: the vav takes a maqaf
// ("ו־3 קורסים"), never a plain "ו" directly against a number.
export const TwoPartsDigitLeading: Story = {
  parameters: { apiMocks: { handlers: { preview: previewHandler({ lessonCount: 2, exceptionCount: 0, courseCount: 3 }) } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(dialog.findByText('מחיקת הרב תמחק גם 2 שיעורים ו־3 קורסים המשויכים אליו.')).resolves.toBeInTheDocument();
  },
};

// All three parts, the last a singular word: comma-separated except the
// last, which takes the vav directly against the word ("וקורס אחד").
export const AllThreeParts: Story = {
  parameters: { apiMocks: { handlers: { preview: previewHandler({ lessonCount: 1, exceptionCount: 2, courseCount: 1 }) } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(dialog.findByText('מחיקת הרב תמחק גם שיעור אחד, 2 חריגים וקורס אחד המשויכים אליו.')).resolves.toBeInTheDocument();
  },
};

// A brand-new rabbi with nothing linked yet: no impact sentence at all,
// never one naming zero of everything.
export const NothingLinked: Story = {
  parameters: { apiMocks: { handlers: { preview: previewHandler({ lessonCount: 0, exceptionCount: 0, courseCount: 0 }) } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await expect(dialog.findByText(parentConsts.DELETE_CONFIRM_IRREVERSIBLE_NOTE)).resolves.toBeInTheDocument();
    expect(dialog.queryByText(/תמחק גם/)).not.toBeInTheDocument();
  },
};

// A rabbanit's own honorific: the trigger, the dialog heading, and the
// impact sentence's own subject and closing pronoun all follow it, never
// the rav's own wording (editor's final re-read: the trigger and the
// heading had stayed fixed masculine while the impact sentence already
// followed the honorific).
export const RabbanitHonorific: Story = {
  args: { honorific: 'rabbanit' },
  parameters: { apiMocks: { handlers: { preview: previewHandler({ lessonCount: 0, exceptionCount: 0, courseCount: 1 }) } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement, 'rabbanit');
    await expect(dialog.findByRole('heading', { name: 'למחוק את הרבנית?' })).resolves.toBeInTheDocument();
    await expect(dialog.findByText('מחיקת הרבנית תמחק גם קורס אחד המשויך אליה.')).resolves.toBeInTheDocument();
  },
};
