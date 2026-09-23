import type { ComponentType } from 'react';
import type { City } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import styled from 'styled-components';

import { installMockFetch, jsonResponse, NEVER_RESOLVES } from '~/storyMocks';

import { CitySelect } from './CitySelect';
import * as consts from './consts';
import type { SelectedCity } from './models';

// This is the control the Safari "new place" bug shipped through
// (`client/src/hooks/useDismissPopover.ts`), and it had no story at
// all before this file, which is why the design gate never once looked at
// it. Follows `AdminPanel/PlaceFormPage/PlaceFormPage.stories.tsx`'s
// `installMockFetch` / `jsonResponse` shape for `/v1/cities`, the one this
// file's caller already uses.
//
// `CitySelect` owns `isOpen` entirely as internal state with no prop to
// drive it (models.ts): the open stories below reach it the same way
// `CityPicker.stories.tsx`'s `openPicker` does, a `play` function clicking
// the real trigger button, the established pattern in this codebase for a
// popover in this shape.
const LONG_CITY_NAME = 'מודיעין-מכבים-רעות';

const cityResults: City[] = [
  { id: '8300', name: 'ראשון לציון', slug: 'ראשון-לציון', area: 'center' },
  { id: '2074', name: 'קריית שמונה', slug: 'קריית-שמונה', area: 'north' },
  { id: '2650', name: LONG_CITY_NAME, slug: 'מודיעין-מכבים-רעות', area: 'center' },
];

// `GET /v1/cities` takes a `q` but this fixture answers the same way
// regardless of it, the same simplification `CityPicker.stories.tsx` makes
// for its own suggestions endpoint: what a story needs to show is the
// result shape, not a real search match. `citiesScenario`, read at fetch
// time and set by each story's own decorator before it renders, is what
// tells the loading, empty and populated stories apart, since they all hit
// the same URL.
type CitiesScenario = 'results' | 'loading' | 'empty';

let citiesScenario: CitiesScenario = 'results';

installMockFetch((url) => {
  if (url.pathname !== '/v1/cities') return null;
  if (citiesScenario === 'loading') return NEVER_RESOLVES;
  if (citiesScenario === 'empty') return jsonResponse(200, { items: [] });
  return jsonResponse(200, { items: cityResults });
});

const withCitiesScenario = (scenario: CitiesScenario) => (Story: ComponentType) => {
  citiesScenario = scenario;
  return <Story />;
};

const PLACEHOLDER_LABEL = 'בחירת עיר';

const StandInField = styled.div(
  ({ theme }) => `
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    inline-size: 100%;
    max-inline-size: 360px;

    > .label {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      font-weight: ${theme.typography.fontWeight.semiBold};
      color: ${theme.colors.text};
    }

    > .helper {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      color: ${theme.colors.textSecondary};
    }
  `,
);

const meta: Meta<typeof CitySelect> = {
  title: 'components/CitySelect',
  component: CitySelect,
  args: {
    city: undefined,
    onSelectCity: fn(),
    placeholderLabel: PLACEHOLDER_LABEL,
  },
};

export default meta;
type Story = StoryObj<typeof CitySelect>;

export const Placeholder: Story = {
  decorators: [withCitiesScenario('results')],
};

// A long real city name (a triple-barrelled municipality name), not the
// short `ראשון לציון` used elsewhere in this file, so the closed pill's
// `.label` ellipsis is actually under pressure rather than sitting well
// inside its content.
export const CitySelected: Story = {
  decorators: [withCitiesScenario('results')],
  args: { city: { id: '2650', name: LONG_CITY_NAME } satisfies SelectedCity },
};

export const WithClearAffordance: Story = {
  decorators: [withCitiesScenario('results')],
  args: { city: { id: '5000', name: 'תל אביב יפו' } satisfies SelectedCity, allowClear: true },
};

export const Invalid: Story = {
  decorators: [withCitiesScenario('results')],
  args: { invalid: true },
};

// How `PlaceFormPage` actually renders this control: a labelled row with a
// helper line beneath, the control spanning the row's full width.
export const FullWidthInAForm: Story = {
  decorators: [withCitiesScenario('results')],
  render: (args) => (
    <StandInField>
      <span className="label">עיר</span>
      <CitySelect {...{ ...args, fullWidth: true }} />
      <span className="helper">העיר שבה נמצא המקום</span>
    </StandInField>
  ),
};

const openCitySelect = async (canvasElement: HTMLElement): Promise<ReturnType<typeof within>> => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: PLACEHOLDER_LABEL }));
  return canvas;
};

export const OpenWithHint: Story = {
  decorators: [withCitiesScenario('results')],
  play: async ({ canvasElement }) => {
    const canvas = await openCitySelect(canvasElement);
    await expect(canvas.findByText(consts.SEARCH_HINT)).resolves.toBeInTheDocument();
  },
};

export const OpenLoading: Story = {
  decorators: [withCitiesScenario('loading')],
  play: async ({ canvasElement }) => {
    const canvas = await openCitySelect(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: consts.SEARCH_LABEL }), 'חי');
    await expect(canvas.findByText(consts.LOADING_MESSAGE)).resolves.toBeInTheDocument();
  },
};

// The story that would have shown the original bug: a real result list,
// including `ראשון לציון` from the bug report and a deliberately long city
// name, rendered as actual selectable options in the open popover.
export const OpenWithResults: Story = {
  decorators: [withCitiesScenario('results')],
  play: async ({ canvasElement }) => {
    const canvas = await openCitySelect(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: consts.SEARCH_LABEL }), 'רא');
    await expect(canvas.findByText('ראשון לציון')).resolves.toBeInTheDocument();
    await expect(canvas.findByText(LONG_CITY_NAME)).resolves.toBeInTheDocument();
  },
};

export const OpenNoResults: Story = {
  decorators: [withCitiesScenario('empty')],
  play: async ({ canvasElement }) => {
    const canvas = await openCitySelect(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: consts.SEARCH_LABEL }), 'קקקקק');
    await expect(canvas.findByText(consts.NO_RESULTS_MESSAGE)).resolves.toBeInTheDocument();
  },
};

// The guarantee this whole change exists for: clicking a result actually
// calls `onSelectCity` and closes the popover. A Chromium run cannot
// reproduce the Safari focus behaviour the bug depended on (a mousedown on
// a <button> not moving focus there), so this would not have caught the
// original bug by itself; it still catches the regression one careless edit
// away, a dismissal listener that fires on an inside pointer, or an
// `onClick` that stops running because the popover unmounted first.
export const SelectsACityAndClosesThePopover: Story = {
  decorators: [withCitiesScenario('results')],
  args: { onSelectCity: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = await openCitySelect(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: consts.SEARCH_LABEL }), 'רא');
    await userEvent.click(await canvas.findByText('ראשון לציון'));
    await expect(args.onSelectCity).toHaveBeenCalledWith({ id: '8300', name: 'ראשון לציון' });
    expect(canvas.queryByRole('textbox', { name: consts.SEARCH_LABEL })).not.toBeInTheDocument();
  },
};
