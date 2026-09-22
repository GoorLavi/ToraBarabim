import type { CityAreaGroup, CityDirectoryResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import { CitiesPage } from './CitiesPage';

const areaGroup = (overrides: Partial<CityAreaGroup>): CityAreaGroup => ({
  area: 'haifa',
  areaName: 'חיפה והקריות',
  slug: 'חיפה-והקריות',
  cities: [
    { id: '4000', name: 'חיפה', slug: 'חיפה', area: 'haifa', lessonCount: 6 },
    { id: '4020', name: 'קריית ביאליק', slug: 'קריית-ביאליק', area: 'haifa', lessonCount: 2 },
  ],
  ...overrides,
});

const directoryHandler = (response: CityDirectoryResponse) => http.get('/v1/cities/directory', jsonResolver(response));

const populatedDirectory: CityDirectoryResponse = {
  areas: [
    areaGroup({}),
    areaGroup({
      area: 'sharon',
      areaName: 'השרון',
      slug: 'השרון',
      cities: [{ id: '4200', name: 'רעננה', slug: 'רעננה', area: 'sharon', lessonCount: 3 }],
    }),
  ],
};

const meta: Meta<typeof CitiesPage> = {
  title: 'CitiesPage/CitiesPage',
  component: CitiesPage,
};

export default meta;
type Story = StoryObj<typeof CitiesPage>;

export const Populated: Story = {
  parameters: { apiMocks: { handlers: { directory: directoryHandler(populatedDirectory) } } },
};
export const Empty: Story = {
  parameters: { apiMocks: { handlers: { directory: directoryHandler({ areas: [] }) } } },
};
export const ServerError: Story = {
  parameters: { apiMocks: { handlers: { directory: http.get('/v1/cities/directory', errorResolver()) } } },
};
export const Loading: Story = {
  parameters: { apiMocks: { handlers: { directory: http.get('/v1/cities/directory', loadingResolver) } } },
};
