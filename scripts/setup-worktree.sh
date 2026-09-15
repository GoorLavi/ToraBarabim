#!/usr/bin/env bash
# Hydrate a fresh worktree before it is used. A worktree can start behind main
# and never has the gitignored root .env, and both failures look like something
# else (no CI, a broken CDK setup). Run once, from anywhere inside the worktree.
#
# Freshness is measured against origin/main, not the local main branch: the
# local branch is whatever was last checked out there and has been found 116
# commits stale. The primary checkout (first in `git worktree list`) is where
# .env lives; it is not assumed to have main checked out.
set -euo pipefail

root=$(git rev-parse --show-toplevel)
primary=$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')

log() { echo "[setup-worktree] $*"; }

if [ "$root" = "$primary" ]; then
  log "this is the primary checkout, nothing to do"
  exit 0
fi

git -C "$root" fetch -q origin main
behind=$(git -C "$root" rev-list --count HEAD..origin/main)
if [ "$behind" -gt 0 ]; then
  if git -C "$root" merge --ff-only origin/main >/dev/null 2>&1; then
    log "was $behind commits behind origin/main, fast-forwarded"
  else
    log "is $behind commits behind origin/main and cannot fast-forward; merge origin/main by hand before continuing"
  fi
else
  log "up to date with origin/main"
fi

if [ -f "$root/.env" ]; then
  log ".env already present"
elif [ -f "$primary/.env" ]; then
  cp "$primary/.env" "$root/.env"
  log "copied .env from $primary"
else
  log "no .env in $primary either; create one from .env.example before running anything"
fi

log "installing dependencies"
npm --prefix "$root" ci --silent
log "done"
