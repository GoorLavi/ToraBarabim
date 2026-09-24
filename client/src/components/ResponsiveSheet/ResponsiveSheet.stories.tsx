import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ResponsiveSheet } from './ResponsiveSheet';

const ARIA_LABEL = 'גיליון לדוגמה';

const meta: Meta<typeof ResponsiveSheet> = {
  title: 'components/ResponsiveSheet',
  component: ResponsiveSheet,
  args: { ariaLabel: ARIA_LABEL, onDismiss: fn() },
};

export default meta;
type Story = StoryObj<typeof ResponsiveSheet>;

// A link, an input and a button, in that order: the three kinds of element
// `focusableElementsIn` (components/helpers.ts) has to find, and the exact
// three the Tab-wrap test plan names.
const ThreeFocusables = (): ReactElement => (
  <>
    <a href="https://example.com">קישור</a>
    <input type="text" aria-label="שדה" />
    <button type="button">כפתור</button>
  </>
);

// Focus moves onto the panel itself on open, never onto its first focusable
// descendant: a sheet whose first control is destructive
// (`DiscardChangesSheet`'s own discard button) must never sit one Enter key
// away from being activated by accident.
export const FocusMovesInOnOpen: Story = {
  render: (args) => (
    <ResponsiveSheet {...args}>
      <ThreeFocusables />
    </ResponsiveSheet>
  ),
  play: async () => {
    const dialog = await within(document.body).findByRole('dialog', { name: ARIA_LABEL });
    await expect(dialog).toHaveFocus();
  },
};

// A caller whose own content autofocuses something (a picker's search
// field) keeps that focus: the sheet's own effect never overrides it.
export const FocusAlreadyInsideIsLeftAlone: Story = {
  render: (args) => (
    <ResponsiveSheet {...args}>
      <ThreeFocusables />
      {/* Its own autoFocus mirrors a real picker's search input, always
          rendered after the three plain focusables above so this is never
          simply "the first focusable" by coincidence. */}
      <input type="text" aria-label="חיפוש" autoFocus />
    </ResponsiveSheet>
  ),
  play: async () => {
    const body = within(document.body);
    const search = await body.findByRole('textbox', { name: 'חיפוש' });
    await expect(search).toHaveFocus();
  },
};

export const EscapeCloses: Story = {
  render: (args) => (
    <ResponsiveSheet {...args}>
      <ThreeFocusables />
    </ResponsiveSheet>
  ),
  play: async ({ args }) => {
    await within(document.body).findByRole('link', { name: 'קישור' });
    await userEvent.keyboard('{Escape}');
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

// An inner control that already claimed the Escape key (`preventDefault` in
// the capture phase, the contract `useDismissPopover.ts` relies on) leaves
// the sheet's own handler with nothing to do. A synthetic stand-in: only
// `SearchSelect.stories.tsx`'s `PopoverInsideASheet` exercises the real
// document-capture-phase listener a nested popover actually uses.
export const EscapeAlreadyHandledInsideIsLeftAlone: Story = {
  render: (args) => (
    <ResponsiveSheet {...args}>
      <button
        type="button"
        onKeyDownCapture={(event) => {
          if (event.key === 'Escape') event.preventDefault();
        }}
      >
        פופאובר פנימי
      </button>
    </ResponsiveSheet>
  ),
  play: async ({ args }) => {
    const button = await within(document.body).findByRole('button', { name: 'פופאובר פנימי' });
    button.focus();
    await userEvent.keyboard('{Escape}');
    await expect(args.onDismiss).not.toHaveBeenCalled();
  },
};

// Tab wraps forward from the last focusable back to the first, and
// shift+Tab wraps backward from the first to the last, over exactly the
// link/input/button trio. Also covers shift+Tab straight from the panel
// itself, where focus actually opens now (not on `first`): without
// treating the panel as the same wrap point as `first`, shift+Tab from
// there escapes the sheet entirely instead of wrapping to `last`.
export const TabWrapsBothWays: Story = {
  render: (args) => (
    <ResponsiveSheet {...args}>
      <ThreeFocusables />
    </ResponsiveSheet>
  ),
  play: async () => {
    const body = within(document.body);
    const dialog = await body.findByRole('dialog', { name: ARIA_LABEL });
    const link = await body.findByRole('link', { name: 'קישור' });
    const button = await body.findByRole('button', { name: 'כפתור' });

    await expect(dialog).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(button).toHaveFocus();

    button.focus();
    await userEvent.tab();
    await expect(link).toHaveFocus();

    link.focus();
    await userEvent.tab({ shift: true });
    await expect(button).toHaveFocus();
  },
};
