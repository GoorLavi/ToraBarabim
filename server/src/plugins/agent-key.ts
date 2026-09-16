import { timingSafeEqual } from 'node:crypto';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { AGENT_KEY_BEARER_PREFIX, AGENT_KEY_UNAUTHENTICATED_MESSAGE } from '../service/lesson-import/consts';

// Constant-time string compare: a plain `===` leaks the key's length and
// where the first mismatched byte is through response timing, which is
// exactly the class of attack a machine credential over the open internet
// has to assume someone will try.
const timingSafeStringEqual = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
};

// A factory, not a plain handler reading `loadConfig` itself: the key is
// resolved once, when `registerAgentRoutes` mounts this guard (which only
// happens when `config.importAgentKey` is set), not on every request.
// Attach the returned function as a preHandler on every route under
// `/v1/agent/imports`. The key opens nothing else: an admin cookie is
// never checked here, and this key is never accepted on an admin route.
export const createAgentKeyGuard = (agentKey: string) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const header = request.headers.authorization;
    const presented = header?.startsWith(AGENT_KEY_BEARER_PREFIX) ? header.slice(AGENT_KEY_BEARER_PREFIX.length) : undefined;

    if (!presented || !timingSafeStringEqual(presented, agentKey)) {
      reply.header('www-authenticate', 'Bearer').status(401).send({ error: 'unauthenticated', message: AGENT_KEY_UNAUTHENTICATED_MESSAGE });
      return;
    }
  };
};
