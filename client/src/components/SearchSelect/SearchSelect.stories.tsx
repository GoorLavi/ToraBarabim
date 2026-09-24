import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ResponsiveSheet } from '~/components/ResponsiveSheet/ResponsiveSheet';

import { SearchSelect } from './SearchSelect';
import type { SearchSelectProps } from './models';

// Exercised here with a generic fixture, not a city, a rabbi or a place, so
// a defect found here is a defect in the shared contract itself, not in one
// caller's data. Mirrors `CitySelect.stories.tsx`'s own `openCitySelect`
// play shape.
interface Option {
  id: string;
  label: string;
}

const LONG_LABEL = 'אפשרות עם שם ארוך במיוחד שבודק שהשורה שורדת נתונים אמיתיים ולא נשברת';

const red: Option = { id: '1', label: 'אדום' };

const options: Option[] = [red, { id: '2', label: 'כחול' }, { id: '3', label: LONG_LABEL }];

const PLACEHOLDER_LABEL = 'בחירת צבע';
const SEARCH_LABEL = 'חיפוש צבע';
const SEARCH_PLACEHOLDER = 'חיפוש צבע';
const HINT = 'הקלד שם צבע';
const LOADING_MESSAGE = 'טוען צבעים...';
const EMPTY_MESSAGE = 'לא נמצאו צבעים תואמים';
const LOAD_ERROR_MESSAGE = 'לא הצלחנו לטעון את רשימת הצבעים';

const SearchSelectOfOption = SearchSelect<Option>;

// `query` is a controlled prop, same as any other caller wires it: this
// wrapper holds the real state so typing in a story's popover behaves like
// it does in the app, while still relaying every change to the `args.
// onQueryChange` mock a play function asserts against.
const ControlledSearchSelect = (args: SearchSelectProps<Option>) => {
  const [query, setQuery] = useState(args.query);
  return (
    <SearchSelectOfOption
      {...args}
      query={query}
      onQueryChange={(value) => {
        setQuery(value);
        args.onQueryChange(value);
      }}
    />
  );
};

const meta: Meta<typeof SearchSelectOfOption> = {
  title: 'components/SearchSelect',
  component: SearchSelectOfOption,
  render: (args) => <ControlledSearchSelect {...args} />,
  args: {
    items: [],
    isPending: false,
    isError: false,
    getItemKey: (item) => item.id,
    isSelected: () => false,
    onSelect: fn(),
    query: '',
    onQueryChange: fn(),
    renderTrigger: () => PLACEHOLDER_LABEL,
    renderOption: (item) => <span dir="auto">{item.label}</span>,
    searchLabel: SEARCH_LABEL,
    searchPlaceholder: SEARCH_PLACEHOLDER,
    loadingMessage: LOADING_MESSAGE,
    emptyMessage: EMPTY_MESSAGE,
    loadErrorMessage: LOAD_ERROR_MESSAGE,
    showChevron: true,
  },
};

export default meta;
type Story = StoryObj<typeof SearchSelectOfOption>;

const openSelect = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: PLACEHOLDER_LABEL }));
  return canvas;
};

export const Closed: Story = {
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.chevron')).toBeInTheDocument();
  },
};

export const NoChevron: Story = {
  args: { showChevron: false },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.chevron')).not.toBeInTheDocument();
  },
};

export const OpenWithHint: Story = {
  args: { hint: HINT },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(HINT)).resolves.toBeInTheDocument();
  },
};

// No `hint`: the "browsable without typing" mode RabbiPicker, RabbiSelect
// and PickerControl all use, where the load states show as soon as the
// popover opens.
export const Loading: Story = {
  args: { isPending: true },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const WithResults: Story = {
  args: { items: options },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText('אדום')).resolves.toBeInTheDocument();
    await expect(canvas.findByText('כחול')).resolves.toBeInTheDocument();
    await expect(canvas.findByText(LONG_LABEL)).resolves.toBeInTheDocument();
  },
};

// The one row `isSelected` marks true: the shared row chrome's own
// `aria-selected` state, not exercised by any other story here.
export const WithASelectedOption: Story = {
  args: { items: options, isSelected: (item) => item.id === red.id },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByRole('option', { name: 'אדום', selected: true })).resolves.toBeInTheDocument();
  },
};

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(EMPTY_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const LoadError: Story = {
  args: { isError: true },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(LOAD_ERROR_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};

// The guarantee this whole change exists for (#63): clicking a result
// actually calls `onSelect` and closes the popover. Typing first also earns
// its own assertion: `onQueryChange` is the one prop this component adds to
// make the query a controlled value, and it has to fire with what was
// actually typed.
export const SelectsAnOptionAndClosesThePopover: Story = {
  args: { items: options, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = await openSelect(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: SEARCH_LABEL }), 'אד');
    await expect(args.onQueryChange).toHaveBeenCalledWith('אד');
    await userEvent.click(await canvas.findByText('אדום'));
    await expect(args.onSelect).toHaveBeenCalledWith(red);
    expect(canvas.queryByRole('textbox', { name: SEARCH_LABEL })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: PLACEHOLDER_LABEL })).toHaveFocus();
  },
};

export const EscapeClosesAndReturnsFocus: Story = {
  args: { items: options },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByRole('textbox', { name: SEARCH_LABEL })).resolves.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(canvas.queryByRole('textbox', { name: SEARCH_LABEL })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: PLACEHOLDER_LABEL })).toHaveFocus();
  },
};

// A `SearchSelect` opened inside a `ResponsiveSheet`, the same shape
// `MoveExceptionSheet`'s `CitySelect` actually renders in: one Escape closes
// the popover alone and leaves the sheet open (`useDismissPopover.ts` owns
// Escape in the capture phase); a second, with nothing left to claim it,
// reaches the sheet. `SearchSelectProps<Option>` has no `onDismiss` of its
// own, so this story's own args are cast to add the one this render needs.
const SHEET_LABEL = 'גיליון לדוגמה';

export const PopoverInsideASheet: Story = {
  args: { items: options, onDismiss: fn() } as unknown as SearchSelectProps<Option>,
  render: (args) => (
    <ResponsiveSheet {...{ ariaLabel: SHEET_LABEL, onDismiss: (args as SearchSelectProps<Option> & { onDismiss: () => void }).onDismiss }}>
      <ControlledSearchSelect {...args} />
    </ResponsiveSheet>
  ),
  play: async ({ args }) => {
    const onDismiss = (args as SearchSelectProps<Option> & { onDismiss: () => void }).onDismiss;
    const body = within(document.body);
    await userEvent.click(await body.findByRole('button', { name: PLACEHOLDER_LABEL }));
    await body.findByRole('textbox', { name: SEARCH_LABEL });

    await userEvent.keyboard('{Escape}');
    expect(body.queryByRole('textbox', { name: SEARCH_LABEL })).not.toBeInTheDocument();
    await body.findByRole('dialog', { name: SHEET_LABEL });

    await userEvent.keyboard('{Escape}');
    await expect(onDismiss).toHaveBeenCalledTimes(1);
  },
};
