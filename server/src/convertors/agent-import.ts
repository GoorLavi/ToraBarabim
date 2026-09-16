import type {
  AgentImportApplyResult,
  AgentImportDecisionResponse,
  AgentImportPlanResponse,
  AgentImportRabbiSearchResult,
} from '@torabarabim/common';

// The service already builds these in their wire shape (it never returns a
// raw database row for the agent surface), so each convertor here is a
// pass-through. Kept as real functions, not a direct `reply.send(result)`
// in the route, so every response on this surface goes through the same
// route → service → convertor seam every other API resource uses, and a
// column added to a service-internal type later cannot leak here by
// accident.
export const toAgentImportPlanResponse = (result: AgentImportPlanResponse): AgentImportPlanResponse => result;
export const toAgentImportRabbiSearchResponse = (result: AgentImportRabbiSearchResult): AgentImportRabbiSearchResult => result;
export const toAgentImportDecisionResponse = (result: AgentImportDecisionResponse): AgentImportDecisionResponse => result;
export const toAgentImportApplyResponse = (result: AgentImportApplyResult): AgentImportApplyResult => result;
