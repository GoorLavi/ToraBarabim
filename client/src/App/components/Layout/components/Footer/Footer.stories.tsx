import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Footer>;

// The install link only exists once the browser has been read after mount,
// and only where there is something to install: a footer without it is the
// ordinary one.
export const WithoutInstallLink: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'יצירת קשר' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'הוספה למסך הבית' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'הוספה למחשב' })).not.toBeInTheDocument();
  },
};

export const WithInstallLinkOnPhone: Story = {
  args: { installLink: { label: 'הוספה למסך הבית', onOpen: fn() } },
  play: async ({ canvasElement, args }) => {
    const link = await within(canvasElement).findByRole('button', { name: 'הוספה למסך הבית' });
    await userEvent.click(link);
    await expect(args.installLink?.onOpen).toHaveBeenCalledTimes(1);
  },
};

export const WithInstallLinkOnComputer: Story = {
  args: { installLink: { label: 'הוספה למחשב', onOpen: fn() } },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('button', { name: 'הוספה למחשב' })).toBeInTheDocument();
  },
};
