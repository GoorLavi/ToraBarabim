import type { FastifyInstance } from 'fastify';

// A POST or DELETE with no body (logout, delete) is sent by the browser
// with no Content-Type at all. API Gateway, which sits in front of this
// server in production, fills that header in with a type Fastify has no
// parser for, so the request is rejected with 415 before it reaches the
// handler. It only fails in production: in development there is no
// gateway in the path, which is why every one of these routes passed a
// manual test and still broke once deployed.
//
// Fail-closed on content, open on emptiness: an empty body under any
// unrecognised type is accepted as "no body", and anything with actual
// content in it is still rejected with 415, so no unparsed payload can
// reach a handler. The registered parsers (JSON, multipart) match first
// and are untouched.
export const registerEmptyBodySupport = (app: FastifyInstance): void => {
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (request, body: Buffer, done) => {
    if (body.length === 0) {
      done(null, undefined);
      return;
    }

    const contentType = request.headers['content-type'] ?? 'none';
    const error = Object.assign(new Error(`expected an empty body for content type ${contentType}, got ${body.length} bytes`), {
      statusCode: 415,
    });
    done(error, undefined);
  });
};
