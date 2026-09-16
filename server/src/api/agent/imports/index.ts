import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import {
  toAgentImportApplyResponse,
  toAgentImportDecisionResponse,
  toAgentImportPlanResponse,
  toAgentImportRabbiSearchResponse,
} from '../../../convertors/agent-import';
import { createAgentKeyGuard } from '../../../plugins/agent-key';
import { IMPORT_BODY_LIMIT_BYTES } from '../../../service/lesson-import/consts';
import {
  AlreadyDecidedError,
  ImportBusyError,
  LinkTargetIsRabbanitError,
  PlanChangedError,
  RuleCoversBuiltInError,
  UnknownCityCodeError,
  UnknownRabbiError,
} from '../../../service/lesson-import/errors';
import * as lessonImportService from '../../../service/lesson-import/lesson-import';
import { agentRabbiListQuerySchema, applyRequestSchema, decisionRequestSchema, planRequestSchema } from '../../../service/lesson-import/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    // `details` is the flattened issues (server/CLAUDE.md's house shape,
    // every other route uses it too); `issues` sits next to it as a
    // path+message pair per issue, since a flattened shape alone forces
    // the reader to reconstruct which row and field failed by hand.
    const issues = error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten(), issues });
  }

  if (error instanceof UnknownRabbiError) {
    return reply.status(400).send({ error: 'unknown_rabbi', message: `הרב '${error.rabbiId}' אינו קיים` });
  }

  if (error instanceof LinkTargetIsRabbanitError) {
    return reply.status(400).send({ error: 'link_target_is_rabbanit', message: 'לא ניתן לקשר שם לרבנית, הייבוא עוסק ברבנים בלבד' });
  }

  if (error instanceof UnknownCityCodeError) {
    return reply.status(400).send({ error: 'unknown_city_code', message: `קוד העיר '${error.cityCode}' אינו קיים` });
  }

  if (error instanceof RuleCoversBuiltInError) {
    return reply.status(400).send({ error: 'rule_covers_built_in', message: error.message });
  }

  if (error instanceof AlreadyDecidedError) {
    return reply.status(409).send({ error: 'already_decided', message: error.message });
  }

  if (error instanceof PlanChangedError) {
    return reply.status(409).send({ error: 'plan_changed', message: 'התוכנית השתנתה מאז שחושבה, יש לתכנן מחדש' });
  }

  if (error instanceof ImportBusyError) {
    return reply.status(409).send({ error: 'import_busy', message: 'ריצת ייבוא אחרת פעילה כרגע' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// The agent import surface: reachable only with the machine key
// (`requireAgentKey`, built once from `agentKey` here, never re-read from
// config per request), never by an admin session, and this key opens
// nothing outside this group.
export const registerAgentImportRoutes = async (app: FastifyInstance, agentKey: string): Promise<void> => {
  const requireAgentKey = createAgentKeyGuard(agentKey);

  app.post(
    '/v1/agent/imports/plan',
    { preHandler: requireAgentKey, bodyLimit: IMPORT_BODY_LIMIT_BYTES },
    async (request, reply) => {
      try {
        const file = planRequestSchema.parse(request.body);
        const result = await lessonImportService.plan(file);
        return reply.send(toAgentImportPlanResponse(result));
      } catch (error) {
        return handleError(reply, error, 'POST /v1/agent/imports/plan');
      }
    },
  );

  app.get('/v1/agent/imports/rabbis', { preHandler: requireAgentKey }, async (request, reply) => {
    try {
      const query = agentRabbiListQuerySchema.parse(request.query);
      const result = await lessonImportService.listRabbisForAgent(query);
      return reply.send(toAgentImportRabbiSearchResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/agent/imports/rabbis');
    }
  });

  app.post('/v1/agent/imports/decisions', { preHandler: requireAgentKey }, async (request, reply) => {
    try {
      const body = decisionRequestSchema.parse(request.body);
      const result = await lessonImportService.decide(body);
      return reply.send(toAgentImportDecisionResponse(result));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/agent/imports/decisions');
    }
  });

  app.post(
    '/v1/agent/imports/apply',
    { preHandler: requireAgentKey, bodyLimit: IMPORT_BODY_LIMIT_BYTES },
    async (request, reply) => {
      try {
        const body = applyRequestSchema.parse(request.body);
        const result = await lessonImportService.apply(body, request.log);
        return reply.send(toAgentImportApplyResponse(result));
      } catch (error) {
        return handleError(reply, error, 'POST /v1/agent/imports/apply');
      }
    },
  );
};
