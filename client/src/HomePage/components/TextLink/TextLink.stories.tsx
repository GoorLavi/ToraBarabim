import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TextLink } from './TextLink';

const meta: Meta<typeof TextLink> = {
  title: 'HomePage/TextLink',
  component: TextLink,
};

export default meta;
type Story = StoryObj<typeof TextLink>;

// The link form goes somewhere: a real anchor with the route as its href.
export const AsALink: Story = {
  args: { to: '/rabbis', children: 'כל הרבנים' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('link', { name: 'כל הרבנים' })).toHaveAttribute('href', '/rabbis');
  },
};

export const AsALinkWithAChevron: Story = {
  args: { to: '/rabbis', children: 'כל הרבנים', withChevron: true },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'כל הרבנים' });
    await expect(link).toHaveClass('withChevron');
  },
};

// The button form does something in place: no href, a plain button that
// shares the link's look and leads with its icon.
export const AsAButtonWithAnIcon: Story = {
  args: {
    children: 'הוספה למסך הבית',
    onClick: fn(),
    icon: <span aria-hidden="true">+</span>,
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: /הוספה למסך הבית/ });

    await expect(canvasElement.querySelector('a')).toBeNull();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
