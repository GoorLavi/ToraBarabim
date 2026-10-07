#!/usr/bin/env bash
# One Mixpanel segmentation report, read through the read-only service account in the
# root .env (decision 0063). The growth lane reads numbers only through this script, so
# no agent ever types a credential into a command line.
#
# Usage, from the repo root:
#   bash scripts/mixpanel-query.sh <event> <from YYYY-MM-DD> <to YYYY-MM-DD> [--on <expr>] [--where <expr>] [--unique]
# --on segments the count by an expression, --where filters it, --unique counts users
# instead of events. Examples:
#   bash scripts/mixpanel-query.sh "Lesson Click" 2026-10-01 2026-10-07 --on 'properties["campaignSource"]'
#   bash scripts/mixpanel-query.sh "Page View" 2026-10-01 2026-10-21 --unique --where '"utm_source=c1-" in properties["path"]'
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
  echo "expected <event> <from> <to> [--on <expr>] [--where <expr>] [--unique], got $# arguments" >&2
  exit 1
fi
event="$1"
from="$2"
to="$3"
shift 3
on=""
where=""
count_type="general"
while [ "$#" -gt 0 ]; do
  case "$1" in
    --on) on="$2"; shift 2 ;;
    --where) where="$2"; shift 2 ;;
    --unique) count_type="unique"; shift ;;
    *) echo "expected --on, --where or --unique, got '$1'" >&2; exit 1 ;;
  esac
done

# The site sends to api-eu.mixpanel.com, so its data is read from the EU query host.
query_url="https://eu.mixpanel.com/api/query/segmentation"

# The credential reaches curl as a config line on stdin rather than as a --user
# argument, so it never sits in the process table where any local process could read it.
args=(
  --get --silent --show-error --fail-with-body
  --config -
  --data-urlencode "project_id=$MIXPANEL_PROJECT_ID"
  --data-urlencode "event=$event"
  --data-urlencode "from_date=$from"
  --data-urlencode "to_date=$to"
  --data-urlencode "unit=day"
  --data-urlencode "type=$count_type"
)
if [ -n "$on" ]; then
  args+=(--data-urlencode "on=$on")
fi
if [ -n "$where" ]; then
  args+=(--data-urlencode "where=$where")
fi

printf 'user = "%s:%s"\n' "$MIXPANEL_SERVICE_ACCOUNT_USERNAME" "$MIXPANEL_SERVICE_ACCOUNT_SECRET" \
  | curl "${args[@]}" "$query_url"
echo
