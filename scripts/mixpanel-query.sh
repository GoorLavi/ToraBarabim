#!/usr/bin/env bash
# One Mixpanel segmentation report, read through the read-only service account in the
# root .env (decision 0063). The growth lane reads numbers only through this script, so
# no agent ever types a credential into a command line.
#
# Usage, from the repo root:
#   bash scripts/mixpanel-query.sh <event> <from YYYY-MM-DD> <to YYYY-MM-DD> [on-expression]
# Example:
#   bash scripts/mixpanel-query.sh "Lesson Click" 2026-10-01 2026-10-07 'properties["utm_source"]'
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
if [ ! -f "$root/.env" ]; then
  echo "expected $root/.env with the Mixpanel service account, found no .env" >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
. "$root/.env"
set +a

: "${MIXPANEL_PROJECT_ID:?expected MIXPANEL_PROJECT_ID in .env, got nothing}"
: "${MIXPANEL_SERVICE_ACCOUNT_USERNAME:?expected MIXPANEL_SERVICE_ACCOUNT_USERNAME in .env, got nothing}"
: "${MIXPANEL_SERVICE_ACCOUNT_SECRET:?expected MIXPANEL_SERVICE_ACCOUNT_SECRET in .env, got nothing}"

if [ "$#" -lt 3 ]; then
  echo "expected <event> <from> <to> [on-expression], got $# arguments" >&2
  exit 1
fi
event="$1"
from="$2"
to="$3"
on="${4:-}"

# The site sends to api-eu.mixpanel.com, so its data is read from the EU query host.
query_url="https://eu.mixpanel.com/api/query/segmentation"

args=(
  --get --silent --show-error --fail-with-body
  --user "$MIXPANEL_SERVICE_ACCOUNT_USERNAME:$MIXPANEL_SERVICE_ACCOUNT_SECRET"
  --data-urlencode "project_id=$MIXPANEL_PROJECT_ID"
  --data-urlencode "event=$event"
  --data-urlencode "from_date=$from"
  --data-urlencode "to_date=$to"
  --data-urlencode "unit=day"
)
if [ -n "$on" ]; then
  args+=(--data-urlencode "on=$on")
fi

curl "${args[@]}" "$query_url"
echo
