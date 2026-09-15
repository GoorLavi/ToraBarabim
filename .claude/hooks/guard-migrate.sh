#!/usr/bin/env bash
# PreToolUse (Bash): agents never apply a database migration. They edit the
# schema and run `npm run db:generate -w server`; the human applies the
# migration (see the create-migration skill). Blocks the npm script and the
# drizzle-kit commands underneath it. Matches the text of the command, fail
# closed, like the AWS profile hook: a command that merely quotes one of these
# is blocked too, and the cost of that is a rewording.
cmd=$(jq -r '.tool_input.command // ""' 2>/dev/null)

if printf '%s' "$cmd" | grep -Eq 'drizzle-kit[[:space:]]+(migrate|push)|db:migrate'; then
  echo "Blocked: agents do not apply migrations. Edit the schema, run 'npm run db:generate -w server', and hand the migration to the human (see the create-migration skill)." >&2
  exit 2
fi
exit 0
