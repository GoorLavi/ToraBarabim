import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SearchSelect } from './SearchSelect';

// The shared control behind CitySelect, RabbiPicker, RabbiSelect and
// PickerControl (client/CLAUDE.md, Component Tree): exercised here with a
// generic fixture, not a city, a rabbi or a place, so a defect found here is
// a defect in the shared contract itself, not in one caller's data. Mirrors
// `CitySelect.stories.tsx`'s own `openCitySelect` play shape.
interface Option {
  id: string;
  label: string;
}

const LONG_LABEL = 'אפשרות עם שם ארוך במיוחד שבודק שהשורה שורדת נתונים אמיתיים ולא נשברת';

const options: Option[] = [
  { id: '1', label: 'אדום' },
  { id: '2', label: 'כחול' },
  { id: '3', label: LONG_LABEL },
];

const PLACEHOLDER_LABEL = 'בחירת צבע';
const SEARCH_LABEL = 'חיפוש צבע';
const SEARCH_PLACEHOLDER = 'חיפוש צבע';
const HINT = 'הקלד שם צבע';
const LOADING_MESSAGE = 'טוען צבעים...';
const EMPTY_MESSAGE = 'לא נמצאו צבעים תואמים';
const ERROR_MESSAGE = 'לא הצלחנו לטעון את רשימת הצבעים';

const SearchSelectOfOption = SearchSelect<Option>;

const meta: Meta<typeof SearchSelectOfOption> = {
  title: 'components/SearchSelect',
  component: SearchSelectOfOption,
  args: {
    items: [],
    isPending: false,
    isError: false,
    getItemKey: (item) => item.id,
    isSelected: () => false,
    onSelect: fn(),
    onQueryChange: fn(),
    renderTrigger: () => PLACEHOLDER_LABEL,
    renderOption: (item) => <span dir="auto">{item.label}</span>,
    searchLabel: SEARCH_LABEL,
    searchPlaceholder: SEARCH_PLACEHOLDER,
    loadingMessage: LOADING_MESSAGE,
    emptyMessage: EMPTY_MESSAGE,
    errorMessage: ERROR_MESSAGE,
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

export const Closed: Story = {};

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

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(EMPTY_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { isError: true },
  play: async ({ canvasElement }) => {
    const canvas = await openSelect(canvasElement);
    await expect(canvas.findByText(ERROR_MESSAGE)).resolves.toBeInTheDocument();
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};

// The guarantee this whole change exists for (#63): clicking a result
// actually calls `onSelect` and closes the popover.
export const SelectsAnOptionAndClosesThePopover: Story = {
  args: { items: options, onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = await openSelect(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: SEARCH_LABEL }), 'אד');
    await userEvent.click(await canvas.findByText('אדום'));
    await expect(args.onSelect).toHaveBeenCalledWith(options[0]);
    expect(canvas.queryByRole('textbox', { name: SEARCH_LABEL })).not.toBeInTheDocument();
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
