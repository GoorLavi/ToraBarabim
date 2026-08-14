import Anthropic from '@anthropic-ai/sdk';

import {
  SCHEDULE_IMAGE_PROMPT,
  SCHEDULE_IMAGE_TOOL_INPUT_SCHEMA,
  SCHEDULE_IMAGE_TOOL_NAME,
  VISION_MAX_TOKENS,
  VISION_MODEL,
} from './consts';
import type { ImageMediaType, ScheduleImage } from './models';
import { ScheduleImageSchema } from './models';

// Reads one schedule poster image with Claude's vision and returns rows
// validated against ScheduleImageSchema. A general reader: any adapter whose
// source publishes its schedule as an image can call this with a different
// image and get the same validated shape back. Throws if the model's
// response cannot be parsed or fails validation, since an unvalidated row is
// exactly the kind of guess this reader must not pass downstream.
export const readScheduleImage = async (
  imageBuffer: Buffer,
  mediaType: ImageMediaType,
  apiKey: string,
): Promise<ScheduleImage> => {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: VISION_MAX_TOKENS,
    tools: [
      {
        name: SCHEDULE_IMAGE_TOOL_NAME,
        description: 'Reports the lesson rows read from a schedule poster image.',
        input_schema: SCHEDULE_IMAGE_TOOL_INPUT_SCHEMA,
      },
    ],
    tool_choice: { type: 'tool', name: SCHEDULE_IMAGE_TOOL_NAME },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBuffer.toString('base64') },
          },
          { type: 'text', text: SCHEDULE_IMAGE_PROMPT },
        ],
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Vision call returned no tool_use block for report_schedule_image');
  }

  const parsed = ScheduleImageSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Vision call returned a schedule image that failed validation: ${JSON.stringify(parsed.error.flatten())}`);
  }

  return parsed.data;
};
