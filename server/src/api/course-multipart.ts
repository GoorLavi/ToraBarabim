import type { FastifyRequest } from 'fastify';
import type { z } from 'zod';

import { CoverRequiredError, MalformedCourseFieldsError } from '../service/course/errors';

const MULTIPART_FILES_LIMIT_CODE = 'FST_FILES_LIMIT';
const TOO_MANY_FILES_MESSAGE = 'ניתן לצרף קובץ תמונה אחד בלבד לבקשה';
const MULTIPART_INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';

// Any error `@fastify/multipart` itself throws while consuming the request
// (not one of the course domain's own errors) carries its own 4xx
// `statusCode`. Mapped here once so both panel routers answer the same way
// to the same failure, instead of one mapping some of the plugin's codes and
// 500ing the rest as unhandled. `FST_FILES_LIMIT` fires when a second file
// part arrives after the create's own cover (`readCourseMultipartCreate`
// opens the parser with `files: 1`); every other plugin error with a 4xx
// status (`FST_INVALID_JSON_FIELD_ERROR`, `FST_MP_PREMATURE_CLOSE`, and any
// later one the plugin adds) reads as a plain `invalid_request`.
export const multipartPluginErrorReply = (error: unknown): { status: number; body: { error: string; message: string } } | undefined => {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
  const { statusCode } = error as { statusCode: unknown };
  if (typeof statusCode !== 'number' || statusCode < 400 || statusCode >= 500) return undefined;

  const isFilesLimit = 'code' in error && error.code === MULTIPART_FILES_LIMIT_CODE;
  return {
    status: statusCode,
    body: isFilesLimit ? { error: 'too_many_files', message: TOO_MANY_FILES_MESSAGE } : { error: 'invalid_request', message: MULTIPART_INVALID_REQUEST_MESSAGE },
  };
};

// A multipart create carries exactly two parts: one JSON field named
// `course`, one file part named `cover`. `@fastify/multipart`'s
// `request.parts()` yields both kinds from the same stream in whatever
// order the client sent them; opened with `files: 1`, so a second file part
// makes the parser itself throw `FST_FILES_LIMIT` (mapped above) rather
// than being read and discarded. A file part that arrives instead of the
// cover, under some other field name, is still read here so its stream
// never keeps the iterator waiting; it is discarded by not matching
// `fieldname === 'cover'`, and the request answers `cover_required` below.
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
