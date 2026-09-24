import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';

import { whatsAppHref } from '~/helpers';

import * as consts from './consts';
import { DedicationWindow } from './DedicationWindow';

const meta: Meta<typeof DedicationWindow> = {
  title: 'HomePage/DedicationBand/DedicationWindow',
  component: DedicationWindow,
  args: { bandType: 'memorial', onDismiss: fn() },
};

export default meta;
type Story = StoryObj<typeof DedicationWindow>;

const resizeFrame = async (widthPx: number, heightPx: number): Promise<void> => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (!frame) throw new Error('DedicationWindow story: window.frameElement not found, expected to be running inside the test runner\'s iframe');
  frame.style.width = `${widthPx}px`;
  frame.style.height = `${heightPx}px`;
  await new Promise((resolve) => window.setTimeout(resolve, 100));
};

// Every string, both hrefs, the accessible names, and that the panel itself
// never scrolls at the one width the design was built to clear (designer
// decisions: "Window 574px, under 576 at 320x640").
export const Phone320x640: Story = {
  play: async () => {
    await resizeFrame(320, 640);
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

    const panel = document.body.querySelector<HTMLElement>('.panel');
    if (!panel) throw new Error('DedicationWindow story: .panel not found');
    expect(panel.scrollHeight).toBeLessThanOrEqual(panel.clientHeight + 1);
  },
};

// Centred, 480 wide, from `md` up (ResponsiveSheet/styles.ts).
export const Desktop: Story = {
  play: async () => {
    await resizeFrame(1280, 900);
    const body = within(document.body);
    const dialog = await body.findByRole('dialog', { name: consts.WINDOW_TITLE });

    await waitFor(() => expect(getComputedStyle(dialog).borderRadius).not.toEqual('0px'));
    expect(dialog.getBoundingClientRect().width).toBeLessThanOrEqual(480);
  },
};

// The X, the backdrop and Escape each close the window exactly once: three
// separate closes, not three separately mounted instances (this story's own
// `onDismiss` is a mock, so closing never actually unmounts anything here).
export const ClosePaths: Story = {
  play: async ({ args }) => {
    await resizeFrame(1280, 900);
    const body = within(document.body);

    await userEvent.click(await body.findByRole('button', { name: consts.CLOSE_LABEL }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Escape}');
    await expect(args.onDismiss).toHaveBeenCalledTimes(2);

    // `fireEvent`, not `userEvent`: the overlay's own bounding box is the
    // full viewport, but `.panel` sits centred inside it and covers the
    // exact point `userEvent.click`'s realistic pointer simulation would
    // aim for (the element's own centre), so a request to click the
    // backdrop lands its hit-test on the panel instead and never resolves.
    // `fireEvent.click` dispatches directly on the node passed to it, with
    // no coordinate hit-test, which is what this assertion actually needs:
    // that the backdrop's own `onClick` fires, not that a point on screen
    // happens to be backdrop and not content.
    const overlay = document.body.querySelector<HTMLElement>('[role="presentation"]');
    if (!overlay) throw new Error('DedicationWindow story: scrim overlay not found');
    fireEvent.click(overlay);
    await expect(args.onDismiss).toHaveBeenCalledTimes(3);
  },
};
