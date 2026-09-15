---
name: ship-pr
description: Stage every change, commit it, push the branch, and open a pull request, in one pass. Use when the human asks to ship, push up and open a PR, or invokes /ship-pr. Orchestrator only. Stops before reading any file that looks like a secret.
---

# Ship PR (stage all, commit, push, open the PR)

Takes the working tree from "uncommitted changes" to "open pull request" in one pass.
Invoking this skill is the explicit request the **Git** rule in `CLAUDE.md` names; it
never runs on the orchestrator's own initiative, and specialist agents never run it.

## Hard rules
- Never `--no-verify`, never force-push, never amend existing history.
- Never stage or commit `.env*`, credentials, keys, or any secret-looking file. If one
  shows up in `git status`, **stop before reading its contents** and tell the human.
- Never commit to `main`. If the current branch is `main`, stop and ask for a branch
  name.
- If a hook fails, fix the cause and commit again; never bypass it.

## Procedure

### 1. Status first, and the stop point
```bash
git branch --show-current
git status --porcelain
```
Scan the file list *before any diff*. A secret-looking name means stop. Only if the list
is clean:
```bash
git diff
git diff --staged
git log -8 --pretty=format:'%s'
```
Read the diff so the commit message says why, and the recent log so the style matches
(short imperative subjects, no type prefix, English).

### 2. Stage and commit
```bash
git add -A
git commit -m "$(cat <<'EOF'
<short imperative subject, under 70 chars>

<one or two sentences on why, not what>

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
)"
```

### 3. Push
```bash
git push -u origin "$(git branch --show-current)"
```

### 4. Open the pull request
Check what the PR will carry, all commits since the branch left `main`:
```bash
git log origin/main..HEAD --pretty=format:'%s'
git diff origin/main...HEAD --stat
```
Then:
```bash
gh pr create --title "<short, under 70 chars>" --body "$(cat <<'EOF'
## Summary
- <bullet>

## Test plan
- [ ] <what was run, and what could not be>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 5. Report
Give the human the PR URL as a link and one line on what shipped. Do not merge:
merging is a deploy, and the merge is always the human's.
