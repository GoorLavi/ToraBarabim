import { z } from 'zod';

// The kinds of image the Anthropic Messages API accepts inline.
export type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

// One lesson row as read off a schedule poster. Every field is optional: a
// row the model cannot read clearly is reported with that field missing,
// never guessed. Shaped generically so a second rabbi's poster can reuse
// this reader without a new schema.
export const ScheduleImageRowSchema = z.object({
  // The weekday name as printed next to this row, e.g. "יום ראשון". Absent
  // if the poster shows only a date, or no weekday at all.
  dayLabel: z.string().optional(),
  // The civil date as printed, e.g. "9.8". Absent if the poster shows only
  // a weekday, or no date at all.
  dateLabel: z.string().optional(),
  // True or false only when the poster itself draws a visible distinction
  // between two styles of time marker (e.g. by a legend) and this row's
  // marker is unambiguously one of them; true for the style the legend
  // marks as recurring, false for the style it marks as one-off. Absent
  // when the poster has no such legend, or the row's marker cannot be told
  // apart from the model's answer to that legend.
  isRecurringMarker: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  topic: z.string().optional(),
});

export type ScheduleImageRow = z.infer<typeof ScheduleImageRowSchema>;

export const ScheduleImageSchema = z.object({
  // Any heading or date range printed on the poster that states which week
  // or period it covers, read verbatim, e.g. "9.8-15.8".
  periodLabel: z.string().optional(),
  // A note printed once for the whole poster describing who may attend
  // (for example, that a women's section is open), read verbatim. Applies
  // to every row, not to one row in particular.
  audienceNote: z.string().optional(),
  rows: z.array(ScheduleImageRowSchema),
});

export type ScheduleImage = z.infer<typeof ScheduleImageSchema>;
