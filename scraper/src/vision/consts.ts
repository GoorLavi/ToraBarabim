import type Anthropic from '@anthropic-ai/sdk';

// A vision-capable model. Not the newest available on every date this runs,
// but current as of this slice; bump deliberately if Anthropic deprecates it.
export const VISION_MODEL = 'claude-sonnet-4-5-20250929';

export const VISION_MAX_TOKENS = 4096;

// Mirrors the shape of ScheduleImageSchema in models.ts. The Messages API
// takes a JSON Schema for a tool's input, not a zod schema directly, so this
// is hand-written to match; keep the two in sync by hand if either changes.
export const SCHEDULE_IMAGE_TOOL_INPUT_SCHEMA: Anthropic.Tool.InputSchema = {
  type: 'object',
  properties: {
    periodLabel: { type: 'string' },
    audienceNote: { type: 'string' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dayLabel: { type: 'string' },
          dateLabel: { type: 'string' },
          isRecurringMarker: { type: 'boolean' },
          startTime: { type: 'string' },
          endTime: { type: 'string' },
          venueName: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          topic: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
  },
  required: ['rows'],
  additionalProperties: false,
};

export const SCHEDULE_IMAGE_TOOL_NAME = 'report_schedule_image';

export const SCHEDULE_IMAGE_PROMPT = `You are reading a photographed or scanned poster that publishes a Torah lesson schedule, in Hebrew. Call ${SCHEDULE_IMAGE_TOOL_NAME} exactly once with what you can read.

Rules:
- Report only what the poster visibly states. Never infer a topic, an audience, a duration, a city, or any other value the poster does not show for that row.
- If the poster prints a heading or date range stating which week or period the schedule covers, report it verbatim as periodLabel.
- If the poster prints a note describing who may attend (for example, that a women's section is open), report it verbatim as audienceNote. It applies to the whole schedule, not one row.
- One entry per lesson row. Preserve the weekday or date exactly as printed for that row (dayLabel, dateLabel); a row can have either, both, or neither.
- If, and only if, the poster itself distinguishes two visual styles of time marker (for example by a legend explaining that one color or fill means a recurring lesson and another means a one-time lesson), set isRecurringMarker per row: true for the style the legend marks as recurring, false for the style it marks as one-time. If there is no such legend, or you cannot tell which style a row uses, leave isRecurringMarker out for that row rather than guessing.
- A topic tag printed beside a group of rows applies only to the rows you can clearly see it belongs to. If it is ambiguous which rows a tag covers, leave topic out for the rows you are unsure about rather than applying it to all of them.
- Leave a field out entirely rather than writing an empty string, a placeholder, or a best guess.`;
