#!/usr/bin/env bash
# PreToolUse (Bash): the production database is reachable from a laptop only
# through the Systems Manager tunnel (infra/scripts/db-tunnel.sh), which needs
# the owner's AWS profile anyway. This closes the other half: an agent never
# opens that tunnel, in any spelling. Text match, fail closed, same trade as
# the AWS profile hook.
cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null)

if printf '%s' "$cmd" | grep -Eq 'db:tunnel|db-tunnel\.sh|ssm[[:space:]]+start-session|start-session[[:space:]]'; then
  echo "Blocked: the production database tunnel is the owner's. Agents work against the local database only; if production data is needed, hand the query to the owner." >&2
  exit 2
fi
exit 0
