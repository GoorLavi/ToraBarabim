import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { whatsAppHref } from '~/helpers';
import { atFrameSize } from '~/storyMocks';

import * as consts from './consts';
import { DedicationWindow } from './DedicationWindow';

const meta: Meta<typeof DedicationWindow> = {
  title: 'HomePage/DedicationBand/DedicationWindow',
  component: DedicationWindow,
  args: { bandType: 'memorial', onDismiss: fn() },
};

export default meta;
type Story = StoryObj<typeof DedicationWindow>;

// Every string, both hrefs, the accessible names, and that the body's own
// scrolling region never scrolls at the width the design was built to clear.
export const Phone320x640: Story = {
  play: () =>
    atFrameSize(320, 640, async () => {
      const body = within(document.body);

      await body.findByRole('dialog', { name: consts.WINDOW_TITLE });
      await expect(body.findByText(consts.FORMULA_MEMORIAL)).resolves.toBeInTheDocument();
      await expect(body.findByText(consts.FORMULA_HEALING)).resolves.toBeInTheDocument();
      await expect(body.findByText(consts.FORMULA_SUCCESS)).resolves.toBeInTheDocument();
      await expect(body.findByText(consts.PARAGRAPH)).resolves.toBeInTheDocument();
      await expect(body.findByText(consts.LEAD_IN)).resolves.toBeInTheDocument();

      const whatsappLink = await body.findByRole('link', { name: consts.WHATSAPP_LABEL });
      await expect(whatsappLink).toHaveAttribute('href', whatsAppHref(consts.WHATSAPP_MESSAGE));

      const callLink = await body.findByRole('link', { name: consts.CALL_ACCESSIBLE_NAME });
      await expect(callLink).toHaveAttribute('href', consts.CALL_HREF);

      await body.findByRole('button', { name: consts.CLOSE_LABEL });

      // `.panel` is `overflow: hidden`, so its own scrollHeight never
      // exceeds its clientHeight regardless of content; `.body` is the
      // actual scrolling region.
      const scrollRegion = document.body.querySelector<HTMLElement>('.body');
      if (!scrollRegion) throw new Error('DedicationWindow story: .body not found');
      expect(scrollRegion.scrollHeight).toBeLessThanOrEqual(scrollRegion.clientHeight + 1);
    }),
};

// Centred, from `md` up (ResponsiveSheet/styles.ts): the panel sits above
// the viewport's own bottom edge (never bottom-anchored), horizontally
// centred, and every corner rounded.
export const Desktop: Story = {
  play: () =>
    atFrameSize(1280, 900, async () => {
      const dialog = await within(document.body).findByRole('dialog', { name: consts.WINDOW_TITLE });
      const rect = dialog.getBoundingClientRect();

      expect(rect.bottom).toBeLessThan(window.innerHeight);
      expect(Math.abs((rect.left + rect.right) / 2 - window.innerWidth / 2)).toBeLessThanOrEqual(1);

      const style = getComputedStyle(dialog);
      expect(style.borderTopLeftRadius).not.toEqual('0px');
      expect(style.borderTopRightRadius).not.toEqual('0px');
      expect(style.borderBottomLeftRadius).not.toEqual('0px');
      expect(style.borderBottomRightRadius).not.toEqual('0px');
    }),
};

// The X, the backdrop and Escape each close the window exactly once: three
// separate closes, not three separately mounted instances (this story's own
// `onDismiss` is a mock, so closing never actually unmounts anything here).
export const ClosePaths: Story = {
  play: ({ args }) =>
    atFrameSize(1280, 900, async () => {
      const body = within(document.body);

      await userEvent.click(await body.findByRole('button', { name: consts.CLOSE_LABEL }));
      await expect(args.onDismiss).toHaveBeenCalledTimes(1);

      await userEvent.keyboard('{Escape}');
      await expect(args.onDismiss).toHaveBeenCalledTimes(2);

      // `fireEvent`, not `userEvent`: `.panel` sits centred over the exact
      // point a realistic pointer click on the overlay would aim for, so a
      // hit-tested click never reaches the backdrop. `fireEvent.click`
      // dispatches directly on the node passed to it, with no hit-test.
      const overlay = document.body.querySelector<HTMLElement>('[role="presentation"]');
      if (!overlay) throw new Error('DedicationWindow story: scrim overlay not found');
      fireEvent.click(overlay);
      await expect(args.onDismiss).toHaveBeenCalledTimes(3);
    }),
};
