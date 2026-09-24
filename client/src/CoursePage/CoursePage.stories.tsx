import type { CourseDetailResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { COURSE_FACT_PRICE_LABEL } from '~/consts';
import { courseDetailFixture } from '~/courseFixture';
import { phoneToInternational, whatsAppHref } from '~/helpers';
import { rabbiFixture } from '~/rabbiFixture';
import { atFrameSize, placeholderPhoto } from '~/storyMocks';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../.storybook/apiMocks';
import * as consts from './consts';
import { CoursePage } from './CoursePage';

const withRoute = (courseId: string) => (Story: React.ComponentType) => (
  <Routes location={{ pathname: `/courses/${courseId}/slug`, search: '', hash: '', state: null, key: 'story' }}>
    <Route path="/courses/:courseId/:slug?" element={<Story />} />
  </Routes>
);

const courseHandler = (course: CourseDetailResponse) => http.get('/v1/courses/:id', jsonResolver(course));

// Cover plus 8 gallery photos, 9 in total, the plan's own worked example
// ("1 מתוך 9").
const nineGalleryPhotos = Array.from({ length: 8 }, (_, index) => ({ id: `photo-${index + 1}`, url: placeholderPhoto(1200, 900) }));

const meta: Meta<typeof CoursePage> = {
  title: 'CoursePage/CoursePage',
  component: CoursePage,
};

export default meta;
type Story = StoryObj<typeof CoursePage>;

export const Open: Story = {
  decorators: [withRoute('story-open')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-open',
            name: 'יסודות האמונה',
            cycle: 3,
            priceShekels: 350,
            hours: 15,
            photos: nineGalleryPhotos,
            state: { status: 'open', contactPhone: '0501234567' },
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Gallery: the counter, the arrow, and a thumbnail tap.
    await expect(canvas.findByText('1 מתוך 9')).resolves.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'לתמונה הבאה' }));
    await waitFor(() => expect(canvas.getByText('2 מתוך 9')).toBeInTheDocument());

    const thumbnails = canvas.getAllByRole('button', { name: /^תמונה \d+$/ });
    const fourthThumbnail = thumbnails[3];
    if (!fourthThumbnail) throw new Error('CoursePage story: fourth thumbnail not found');
    await userEvent.click(fourthThumbnail);
    await waitFor(() => expect(canvas.getByText('4 מתוך 9')).toBeInTheDocument());

    // Opens and closes the full-screen viewer.
    await userEvent.click(canvas.getByRole('button', { name: 'הצגת התמונה במסך מלא' }));
    const dialog = await within(document.body).findByRole('dialog');
    const closeButton = within(dialog).getByRole('button', { name: 'סגירה' });
    await userEvent.click(closeButton);
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument());

    // The WhatsApp href carries the course name (encoded) and the course's
    // own number, never the site's own support number.
    const whatsappLink = canvas.getByRole('link', { name: consts.CONTACT_BAR_WHATSAPP_LABEL });
    await expect(whatsappLink).toHaveAttribute(
      'href',
      whatsAppHref(consts.whatsAppMessage('יסודות האמונה'), phoneToInternational('0501234567')),
    );

    // The call href dials the same number, converted to international form.
    const callLink = canvas.getByRole('link', { name: consts.CONTACT_BAR_CALL_LABEL });
    await expect(callLink).toHaveAttribute('href', `tel:+${phoneToInternational('0501234567')}`);
  },
};

// Desktop, 1280: two columns, the fixed bar gone (design brief A, item 1).
export const OpenDesktop: Story = {
  decorators: [withRoute('story-open-desktop')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-open-desktop',
            name: 'יסודות האמונה',
            cycle: 3,
            priceShekels: 350,
            state: { status: 'open', contactPhone: '0501234567' },
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) =>
    atFrameSize(1280, 900, async () => {
      const canvas = within(canvasElement);
      const layout = canvasElement.querySelector<HTMLElement>('.layout');
      if (!layout) throw new Error('CoursePage story: .layout not found');
      await waitFor(() => expect(getComputedStyle(layout).flexDirection).toEqual('row'));

      const phoneActions = canvasElement.querySelector<HTMLElement>('.phoneActions');
      if (!phoneActions) throw new Error('CoursePage story: .phoneActions not found');
      expect(getComputedStyle(phoneActions).display).toEqual('none');

      await expect(canvas.findByRole('link', { name: consts.WHATSAPP_FULL_LABEL })).resolves.toBeInTheDocument();
    }),
};

export const NotOpenYet: Story = {
  decorators: [withRoute('story-not-open')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-not-open',
            name: 'יסודות האמונה',
            openingDate: '2027-01-10',
            state: { status: 'notOpen', contactPhone: '0501234567' },
          }),
        ),
      },
    },
  },
};

// Registration closed by the calendar or by hand: the fixed contact bar is
// gone, replaced by the plum ClosedPanel, and there is no action button
// left on the page at all (plan section 8, "Closed page: has no action
// buttons").
export const ClosedByCalendar: Story = {
  decorators: [withRoute('story-closed')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-closed',
            name: 'יסודות האמונה',
            state: { status: 'closed', reason: 'closed', closedOn: '2026-10-20' },
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Rendered twice (real and mirrored, one per breakpoint); only its
    // presence matters here, not which copy is visible.
    await waitFor(() => expect(canvas.getAllByText('ההרשמה נסגרה').length).toBeGreaterThan(0));
    await expect(canvas.queryByRole('link', { name: consts.CONTACT_BAR_WHATSAPP_LABEL })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('link', { name: consts.CONTACT_BAR_CALL_LABEL })).not.toBeInTheDocument();
  },
};

export const MarkedFull: Story = {
  decorators: [withRoute('story-full')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-full',
            name: 'יסודות האמונה',
            state: { status: 'closed', reason: 'full', closedOn: '2026-10-20' },
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getAllByText('תפוסה מלאה').length).toBeGreaterThan(0));
    await expect(canvas.queryByRole('link', { name: consts.CONTACT_BAR_WHATSAPP_LABEL })).not.toBeInTheDocument();
  },
};

// No price, no hours: both dropped, never a placeholder ("-" or "0").
export const NoPriceNoHours: Story = {
  decorators: [withRoute('story-bare')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({ id: 'story-bare', name: 'קורס בסיסי', hours: undefined, priceShekels: undefined, cycle: undefined }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(COURSE_FACT_PRICE_LABEL)).not.toBeInTheDocument();
  },
};

// A free-text (unlinked) teacher: no `TeacherSection`, and the closed
// panel's own way forward goes to the home page instead of a rabbi's page.
export const UnlinkedTeacherClosed: Story = {
  decorators: [withRoute('story-unlinked')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-unlinked',
            name: 'סדנת הכנה לחתונה',
            teacher: { kind: 'named', name: 'צוות המרכז הקהילתי' },
            state: { status: 'closed', reason: 'closed', closedOn: '2026-10-20' },
          }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getAllByText('ההרשמה נסגרה').length).toBeGreaterThan(0));
    await expect(canvas.getAllByRole('link', { name: 'לעמוד הבית' }).length).toBeGreaterThan(0);
  },
};

// A registered place as the venue, instead of a typed address.
export const PlaceVenue: Story = {
  decorators: [withRoute('story-place-venue')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-place-venue',
            name: 'יסודות האמונה',
            venue: {
              kind: 'place',
              placeId: 'place-1',
              slug: 'בית-הכנסת-המרכזי',
              name: 'בית הכנסת המרכזי',
              street: 'רחוב ויצמן 45',
              city: 'נתניה',
              citySlug: 'נתניה',
              area: 'sharon',
            },
          }),
        ),
      },
    },
  },
};

export const LongName: Story = {
  decorators: [withRoute('story-longname')],
  parameters: {
    apiMocks: {
      handlers: {
        course: courseHandler(
          courseDetailFixture({
            id: 'story-longname',
            name: 'קורס עיוני מקיף בהלכות שבת ומועדים, מהבסיס ועד לרמה מתקדמת ביותר',
            teacher: { kind: 'rabbi', rabbi: rabbiFixture({ id: 'story-longname-rabbi', name: 'נתן צבי אשכנזי הכהן' }) },
          }),
        ),
      },
    },
  },
};

export const NotFound: Story = {
  decorators: [withRoute('story-notfound')],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/courses/:id', errorResolver(404, 'course_not_found', 'לא נמצא')) } } },
};

export const ServerError: Story = {
  decorators: [withRoute('story-error')],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/courses/:id', errorResolver()) } } },
};

export const Loading: Story = {
  decorators: [withRoute('story-loading')],
  parameters: { apiMocks: { handlers: { course: http.get('/v1/courses/:id', loadingResolver) } } },
};
