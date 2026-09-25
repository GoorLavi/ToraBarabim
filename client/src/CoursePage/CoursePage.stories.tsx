import type { CourseDetailResponse } from '@torabarabim/common';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CALL_ACCESSIBLE_NAME_PREFIX } from '~/components/ContactActions/consts';
import { COURSE_FACT_PRICE_LABEL } from '~/consts';
import { courseDetailFixture } from '~/courseFixture';
import { phoneDisplay } from '~/helpers';
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

    // The cycle tag beside the course name: scoped to the tag itself with
    // a `selector`, since a function matcher also tests ".tags", whose own
    // combined text repeats it when there is no topic tag beside it
    // (design gate round 3 finding); whitespace normalized on both sides,
    // since `cycleLabel` joins the word and the number with a non-breaking
    // space, not the normal one a literal comparison would expect.
    const normalizeSpaces = (value: string): string => value.replace(/\s/gu, ' ');
    await expect(
      canvas.getByText((_, element) => normalizeSpaces(element?.textContent ?? '') === normalizeSpaces(consts.cycleLabel(3)), {
        selector: '.cycleTag',
      }),
    ).toBeInTheDocument();

    // Gallery on phone: a full-bleed slide strip, one button per photo,
    // each opening the full viewer at its own index (the stage's own
    // arrows and counter overlay the strip, design gate round 3, but a
    // swipe or a direct tap still works the same). The strip only exists
    // below `lg` (CourseGallery/styles.ts), so this needs the real, narrow
    // frame, not just Storybook's own cosmetic viewport global, which the
    // vitest test runner never applies to the page.
    await atFrameSize(375, undefined, async () => {
      const fourthSlide = canvas.getByRole('button', { name: 'הצגת תמונה 4 במסך מלא' });
      await userEvent.click(fourthSlide);
      const dialog = await within(document.body).findByRole('dialog');
      await expect(within(dialog).getByText('4 מתוך 9')).toBeInTheDocument();

      // The viewer's own next arrow and close button.
      await userEvent.click(within(dialog).getByRole('button', { name: 'לתמונה הבאה' }));
      await waitFor(() => expect(within(dialog).getByText('5 מתוך 9')).toBeInTheDocument());
      await userEvent.click(within(dialog).getByRole('button', { name: 'סגירה' }));
      await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument());
    });

    // The WhatsApp href carries the course name (encoded) and the course's
    // own number, never the site's own support number: a literal string, not
    // a call through the same helpers that build it, so the test would
    // actually notice a broken encoding or a swapped number.
    const whatsappLink = canvas.getByRole('link', { name: consts.CONTACT_BAR_WHATSAPP_LABEL });
    await expect(whatsappLink).toHaveAttribute(
      'href',
      'https://wa.me/972501234567?text=%D7%A9%D7%9C%D7%95%D7%9D%2C%20%D7%A8%D7%90%D7%99%D7%AA%D7%99%20%D7%91%D7%90%D7%AA%D7%A8%20%D7%AA%D7%95%D7%A8%D7%94%20%D7%91%D7%A8%D7%91%D7%99%D7%9D%20%D7%90%D7%AA%20%D7%94%D7%A7%D7%95%D7%A8%D7%A1%20%22%D7%99%D7%A1%D7%95%D7%93%D7%95%D7%AA%20%D7%94%D7%90%D7%9E%D7%95%D7%A0%D7%94%22%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A0%D7%95%D7%A1%D7%A4%D7%99%D7%9D.',
    );

    // The call href dials the same number, converted to international form.
    // The accessible name is the call button's own override, not its short
    // visible label ("שיחה"): ContactActions.tsx always names a phone
    // number, never just the action.
    const callLink = canvas.getByRole('link', { name: `${CALL_ACCESSIBLE_NAME_PREFIX} ${phoneDisplay('0501234567')}` });
    await expect(callLink).toHaveAttribute('href', 'tel:+972501234567');
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
            priceShekels: 350,
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
    await expect(canvas.queryByRole('link', { name: `${CALL_ACCESSIBLE_NAME_PREFIX} ${phoneDisplay('0501234567')}` })).not.toBeInTheDocument();
    // A closed course keeps its price row: the facts list never conditions
    // on state, only on whether a price was ever set.
    await expect(canvas.getAllByText('350 ₪ לכל הקורס').length).toBeGreaterThan(0);
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
