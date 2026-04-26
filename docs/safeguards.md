# Safeguards

Automated and conventional checks that prevent the most common ways this repo could get broken or leak data.

## Install (one-time per clone)

The hooks are versioned in `.githooks/` and activated by setting the repo to use that path. Run **once** after cloning:

```bash
bash scripts/install-hooks.sh
```

This is idempotent — running it again is a no-op.

To verify hooks are active:

```bash
git config core.hooksPath
# → .githooks
```

To disable hooks temporarily (you almost never want this):

```bash
git config --unset core.hooksPath
```

## What each hook does

### `pre-commit` — runs before every commit

Blocks the commit if any of these are true:

| Check | Why |
|---|---|
| Author email is not `*@users.noreply.github.com` | Prevents the GitHub email-privacy push rejection (GH007). |
| Staged files include `dist/`, `node_modules/`, `.astro/` | These are generated and should never be committed (already gitignored, but `git add -f` could force them). |
| Staged files include `.env*` or paths matching `*secret*` / `*token*` / `*credential*` | Hard refuse — prevents credential leaks. |

**Bypass (do not use casually):**

```bash
git commit --no-verify    # skips ALL hooks; only acceptable for the very first
                          # commit of a fresh clone before install-hooks.sh has run
```

### `commit-msg` — runs after you write the message, before commit finalizes

Blocks the commit if the message doesn't start with one of:

```
feat:  fix:  refactor:  docs:  test:  chore:  init:  pre:  style:  perf:  ci:  post:
```

Matches the global rule in `~/.claude/CLAUDE.md`. See [content-workflow.md](content-workflow.md) for when to use each.

### `pre-push` — runs before every push

Blocks the push if any of these are true:

| Check | Why |
|---|---|
| Any commit being pushed has a message starting with `pre:` | `pre: snapshot` commits are local-only safety nets. Squash them before publishing. |
| Push is `--force` (without `--force-with-lease`) to `main` | `--force` overwrites without checking that the remote hasn't moved. `--force-with-lease` is safer; use it explicitly. |

The hook prints what's wrong and exactly how to fix it.

## Conventional safeguards (no hook, just discipline)

These aren't enforced by hooks but are part of the workflow:

- **Tag before risky changes**: `git tag pre-<thing>` before redesigns or sweeping edits. See [git-workflow.md](git-workflow.md).
- **Edit content on `draft`, not `main`**: see [content-workflow.md](content-workflow.md). Pushing to `main` directly works but skips the staging checkpoint.
- **Run `npm run build` locally before pushing**: catches schema errors and TypeScript issues before they fail the GitHub Actions deploy.

## Exit criteria — "is this safe to merge into main?"

Before `git checkout main && git merge draft && git push origin main`:

1. ✅ `npm run build` exits 0 on the latest `draft` head.
2. ✅ You've eyeballed the change with `npm run dev` (or `npm run preview` for the production build).
3. ✅ All commits being merged use conventional prefixes (the `commit-msg` hook guarantees this).
4. ✅ No `pre: snapshot` commits in the range (the `pre-push` hook will block if there are).

If all four pass, merge and push. The Actions deploy will rebuild the live site in ~90 seconds.

## What's intentionally NOT enforced

- **GitHub branch protection** — server-side rules requiring linear history, reviews, etc. Overkill for a solo content site; can layer on later if collaboration starts.
- **CI lint/test step** — there is no test suite; `astro check` runs inside `npm run build` and is the only gate.
- **Automatic `npm audit`** — too noisy on a fresh Astro template (50+ low-severity dependabot reports). Audit manually before major dep bumps.

## When a hook fires unexpectedly

Read the message — every hook prints its reason and the exact fix command. If the fix doesn't make sense for what you're doing, the hook is probably correct and you're about to do something you shouldn't. Re-read [git-workflow.md](git-workflow.md) and [content-workflow.md](content-workflow.md) before bypassing with `--no-verify`.
