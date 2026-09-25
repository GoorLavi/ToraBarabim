import type { FastifyRequest } from 'fastify';
import type { z } from 'zod';

import { CoverRequiredError, MalformedCourseFieldsError } from '../service/course/errors';

// A multipart create carries exactly two parts: one JSON field named
// `course`, one file part named `cover`. `@fastify/multipart`'s
// `request.parts()` yields both kinds from the same stream in whatever
// order the client sent them. Every part's stream must be consumed (or the
// iterator hangs waiting for it to drain), so a file part that is not the
// cover, or a second one, is read and discarded rather than left untouched.
// Shared by the rabbi and the admin course routes: both read the exact same
// shape and both validate the JSON field against their own Zod schema.
export const readCourseMultipartCreate = async <T>(request: FastifyRequest, maxFileSizeBytes: number, fieldsSchema: z.ZodType<T>): Promise<{ fields: T; cover: Buffer }> => {
  let fieldsJson: string | undefined;
  let cover: Buffer | undefined;

  for await (const part of request.parts({ limits: { fileSize: maxFileSizeBytes, files: 1 } })) {
    if (part.type === 'file') {
      const bytes = await part.toBuffer();
      if (part.fieldname === 'cover' && cover === undefined) cover = bytes;
      continue;
    }
    if (part.fieldname === 'course' && typeof part.value === 'string') fieldsJson = part.value;
  }

  if (fieldsJson === undefined) throw new MalformedCourseFieldsError();
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(fieldsJson);
  } catch {
    throw new MalformedCourseFieldsError();
  }
  const fields = fieldsSchema.parse(parsedJson);

  if (cover === undefined) throw new CoverRequiredError();

  return { fields, cover };
};
