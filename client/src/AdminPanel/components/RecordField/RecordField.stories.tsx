import type { Meta, StoryObj } from '@storybook/react-vite';

import { RecordField } from './RecordField';

// A plain component with no data fetching of its own, so no route or mock
// fetch is needed: `LessonViewPage`/`RabbiViewPage` are the real callers,
// this isolates the row itself, its measured height and its wrap padding,
// which is exactly what the design review is judging.
const meta: Meta<typeof RecordField> = {
  title: 'AdminPanel/RecordField',
  component: RecordField,
};

export default meta;
type Story = StoryObj<typeof RecordField>;

export const Filled: Story = {
  args: { label: 'עיר', value: 'בני ברק' },
};

export const Empty: Story = {
  args: { label: 'תקציר', value: 'לא הוזן תקציר', isEmpty: true },
};

// The open question for the designer: the row's measured height and its
// wrap padding once a real value runs long enough to wrap to two or three
// lines, e.g. a venue name plus a floor note.
export const LongValueWraps: Story = {
  args: {
    label: 'שם המקום',
    value: 'בית מדרש "אהבת ישראל" של קהילת יוצאי מרוקו, קומה שנייה, כניסה מהחצר האחורית ליד גן הילדים',
  },
};
