import type { FastifyRequest } from 'fastify';

// A multipart create carries exactly two parts: one JSON field named
// `course`, one file part named `cover`. `@fastify/multipart`'s
// `request.parts()` yields both kinds from the same stream in whatever
// order the client sent them, buffering the file part as soon as it is
// seen (a part must be consumed before the iterator advances, or its bytes
// are lost). Shared by the rabbi and the admin course routes: both read the
// exact same two-part shape.
export const readCourseMultipartCreate = async (
  request: FastifyRequest,
  maxFileSizeBytes: number,
): Promise<{ fieldsJson?: string; cover?: Buffer }> => {
  let fieldsJson: string | undefined;
  let cover: Buffer | undefined;

  for await (const part of request.parts({ limits: { fileSize: maxFileSizeBytes } })) {
    if (part.type === 'file' && part.fieldname === 'cover') {
      cover = await part.toBuffer();
    } else if (part.type === 'field' && part.fieldname === 'course' && typeof part.value === 'string') {
      fieldsJson = part.value;
    }
  }

  return { fieldsJson, cover };
};
