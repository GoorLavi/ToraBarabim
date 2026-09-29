import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { courseResponseFixture } from '~/courseFixture';
import { panelShellDecorator } from '~/storyDecorators';
import { isoDateOffsetByDays } from '~/storyMocks';

import { errorResolver, http, jsonResolver, loadingResolver } from '../../../.storybook/apiMocks';
import * as consts from './consts';
import { CoursesListPage } from './CoursesListPage';

const openCourse = courseResponseFixture({ id: 'course-open', name: 'יסודות האמונה', cycle: 3 });
// `closedOn` a week ahead of `leavesListsOn`, the course's own real order,
// computed against today rather than a fixed date that will quietly move
// to the other side of it (design gate round 4 finding).
const closedCourse = courseResponseFixture({
  id: 'course-closed',
  name: 'הלכות שבת מעשיות',
  lifecycle: { status: 'closed', reason: 'closed', closedOn: isoDateOffsetByDays(0), leavesListsOn: isoDateOffsetByDays(7) },
});
const fullCourse = courseResponseFixture({
  id: 'course-full',
  name: 'עיון בפרשת השבוע',
  lifecycle: { status: 'closed', reason: 'full', closedOn: isoDateOffsetByDays(-3), leavesListsOn: isoDateOffsetByDays(4) },
});

const meta: Meta<typeof CoursesListPage> = {
  title: 'RabbiPanel/CoursesListPage',
  component: CoursesListPage,
  parameters: { layout: 'fullscreen' },
  decorators: [panelShellDecorator],
};

export default meta;
type Story = StoryObj<typeof CoursesListPage>;

export const Populated: Story = {
  parameters: {
    apiMocks: { handlers: { courses: http.get('/v1/rabbi/courses', jsonResolver({ items: [openCourse, closedCourse, fullCourse], page: 1, pageSize: 50, total: 3 })) } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText('יסודות האמונה')).resolves.toBeInTheDocument();
    await expect(canvas.getByText('הלכות שבת מעשיות')).toBeInTheDocument();
    await expect(canvas.getByText('עיון בפרשת השבוע')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  parameters: { apiMocks: { handlers: { courses: http.get('/v1/rabbi/courses', loadingResolver) } } },
};

export const Empty: Story = {
  parameters: { apiMocks: { handlers: { courses: http.get('/v1/rabbi/courses', jsonResolver({ items: [], page: 1, pageSize: 50, total: 0 })) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(consts.EMPTY_HEADLINE)).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: consts.EMPTY_CTA })).toBeInTheDocument();
  },
};

export const Failed: Story = {
  parameters: { apiMocks: { handlers: { courses: http.get('/v1/rabbi/courses', errorResolver()) } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('alert')).resolves.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: consts.RETRY_LABEL })).toBeInTheDocument();
  },
};
