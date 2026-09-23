import type { PlaceProfileResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { panelShellDecorator } from '~/storyDecorators';
import { installMockFetch, jsonResponse, NEVER_RESOLVES, placeholderPhoto } from '~/storyMocks';

import { ProfilePage } from './ProfilePage';

const PLACEHOLDER_PHOTO = placeholderPhoto(1200, 675);

const baseProfile: PlaceProfileResponse = {
  id: 'place-1',
  slug: 'בית-הכנסת-המרכזי-אהל-יצחק-ומאיר',
  name: 'בית הכנסת המרכזי אהל יצחק ומאיר',
  street: 'רחוב ויצמן 45',
  floor: 'קומה 2',
  cityCode: 4000,
  cityName: 'נתניה',
  area: 'sharon',
  photoUrl: PLACEHOLDER_PHOTO,
};

const noPhotoProfile: PlaceProfileResponse = { ...baseProfile, photoUrl: undefined };

type Scenario = 'populated' | 'noPhoto' | 'loading' | 'error';
let scenario: Scenario = 'populated';

installMockFetch((url) => {
  if (url.pathname !== '/v1/place/profile') return null;
  if (scenario === 'loading') return NEVER_RESOLVES;
  if (scenario === 'error') return jsonResponse(500, { error: 'internal_error', message: 'שגיאה' });
  return jsonResponse(200, scenario === 'noPhoto' ? noPhotoProfile : baseProfile);
});

const withScenario = (value: Scenario) => () => {
  scenario = value;
  return <ProfilePage />;
};

const meta: Meta<typeof ProfilePage> = {
  title: 'PlacePanel/ProfilePage',
  component: ProfilePage,
  // Renders inside PlaceShell's own gutter in the app; no story mounts the
  // shell, so `panelShellDecorator` stands in for it once `fullscreen`
  // cancels Storybook's own frame padding (design gate finding).
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof ProfilePage>;

// The long place name (`build brief`'s own example) prefilled into the name
// field, and a full address including a floor: the layout has to survive
// both without wrapping the ticket-style two-line address rule the design
// system warns about.
export const Populated: Story = { render: withScenario('populated') };

// The closest this single-record edit screen has to the ratified "empty"
// state: no photo uploaded yet, so the soft placeholder shows instead
// (design-system.md, "Rabbi image fallback", which this screen follows the
// same way for a place).
export const NoPhoto: Story = { render: withScenario('noPhoto') };

export const Loading: Story = { render: withScenario('loading') };
export const ErrorState: Story = { render: withScenario('error') };
