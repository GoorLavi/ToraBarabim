import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

// `credentials: true` is required once any route relies on a session
// cookie: without it the browser blocks the response outright (net::ERR_FAILED),
// not just a missing cookie, because Access-Control-Allow-Credentials
// must be present whenever a cross-origin request carries credentials.
// Methods are listed explicitly because the plugin's default is the
// "simple method" set (GET, HEAD, POST): every write route here also
// uses PATCH and DELETE, and relying on the default silently strips
// the preflight response of both, breaking edit and delete from a browser.
const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'];

export const registerCors = async (app: FastifyInstance, origins: string[]): Promise<void> => {
  await app.register(cors, { origin: origins, credentials: true, methods: ALLOWED_METHODS });
};
