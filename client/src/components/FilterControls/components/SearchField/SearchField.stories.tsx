import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import styled from 'styled-components';

import * as consts from './consts';
import { SearchField } from './SearchField';

interface CommittedSearchFieldProps {
  initialValue?: string;
  holdCommits?: boolean;
}

// The pill is white-on-transparent, meant for `FilterControls`'s own plum
// band, not Storybook's near-white canvas (mirrors CityPicker.stories).
const HeaderBand = styled.div(
  ({ theme }) => `
    background: ${theme.colors.primary};
    padding: ${theme.spacing.lg};
  `,
);

// Mirrors what `useSearchQuery` does on the real page: the committed value
// is trimmed on its way to the URL and handed straight back as `value`. A
// harness that echoed the raw draft back instead would keep the
// trailing-space story green while the live field still swallowed the
// space, because the trim is the whole mechanism of that defect.
const CommittedSearchField = ({ initialValue = '', holdCommits = false }: CommittedSearchFieldProps): React.ReactNode => {
  const [committed, setCommitted] = useState(initialValue);
  const [heldCommit, setHeldCommit] = useState<string | null>(null);

  // `holdCommits` stands in for a route whose loader delays the URL update:
  // the value leaves the field but does not come back until the story
  // releases it, which is the window someone keeps typing through.
  const onChange = (next: string): void => {
    if (holdCommits) setHeldCommit(next.trim());
    else setCommitted(next.trim());
  };

  const release = (): void => {
    setCommitted(heldCommit ?? '');
    setHeldCommit(null);
  };

  return (
    <>
      <SearchField {...{ value: committed, onChange }} />
      <p>committed: {committed}</p>
      <button type="button" onClick={() => setCommitted('ירושלים')}>
        commit from elsewhere
      </button>
      {heldCommit !== null && (
        <button type="button" onClick={release}>
          release held commit
        </button>
      )}
    </>
  );
};

const meta: Meta<typeof CommittedSearchField> = {
  title: 'FilterControls/SearchField',
  component: CommittedSearchField,
  decorators: [
    (Story) => (
      <HeaderBand>
        <Story />
      </HeaderBand>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CommittedSearchField>;

const field = (canvasElement: HTMLElement): HTMLInputElement =>
  within(canvasElement).getByRole('searchbox', { name: consts.LABEL }) as HTMLInputElement;

// Nothing typed yet: placeholder only, and no clear button to press.
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(field(canvasElement)).toHaveValue('');
    expect(canvas.queryByRole('button', { name: consts.CLEAR_LABEL })).not.toBeInTheDocument();
  },
};

// Arriving on a link that already carries a search term: the field shows it
// and offers the clear button.
export const WithValue: Story = {
  args: { initialValue: 'הרב אליהו' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(field(canvasElement)).toHaveValue('הרב אליהו');
    await userEvent.click(canvas.getByRole('button', { name: consts.CLEAR_LABEL }));
    expect(field(canvasElement)).toHaveValue('');
  },
};

// The defect this field shipped: a space typed within the debounce window
// was committed as a trimmed value, which echoed back through `value` and
// deleted the space from under the person still typing the next word.
//
// The assertion is on the state after the second word, not on the field
// straight after the commit: the trimmed value and the effect that echoes
// it back land in separate renders, so an assertion in between passes or
// fails on timing rather than on the defect. Typing on is also what the
// person was doing when the space vanished.
export const TrailingSpaceSurvivesCommit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), 'בני ברק ');
    await waitFor(() => expect(canvas.getByText('committed: בני ברק')).toBeInTheDocument());

    await userEvent.type(field(canvasElement), 'הרב');
    expect(field(canvasElement)).toHaveValue('בני ברק הרב');
    await waitFor(() => expect(canvas.getByText('committed: בני ברק הרב')).toBeInTheDocument());
  },
};

// The other half of that guard: a value that changed outside typing, from
// browser back/forward or a link, still replaces whatever is in the field.
export const ExternalCommitReplacesDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), 'טבריה');
    await userEvent.click(canvas.getByRole('button', { name: 'commit from elsewhere' }));

    await waitFor(() => expect(field(canvasElement)).toHaveValue('ירושלים'));

    // The replaced draft must also stop being committed: a field that kept
    // "טבריה" in flight would hand it back a beat later and undo the
    // navigation it just followed.
    await waitFor(() => expect(canvas.getByText('committed: ירושלים')).toBeInTheDocument());
  },
};

// The same defect one step further out, and the reason the guard compares
// against what this field last committed rather than against the text: a
// commit that comes back slowly arrives while the next word is already
// typed, and a field that trusted the returning value would delete it.
export const TypingSurvivesASlowCommit: Story = {
  args: { holdCommits: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), 'בני ברק');

    const release = await canvas.findByRole('button', { name: 'release held commit' });
    await userEvent.type(field(canvasElement), ' הרב');
    await userEvent.click(release);

    expect(field(canvasElement)).toHaveValue('בני ברק הרב');
  },
};
