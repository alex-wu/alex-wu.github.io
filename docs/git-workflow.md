# Git workflow

Branching, snapshots, and reverts for this repo.

## The model

```
draft  ─── edit ─── commit ─── push ─── (visible on GitHub, NOT deployed)
   │
   └── merge ──→  main  ─── push ─── (deploys to alex-wu.github.io)
```

Two long-lived branches:

- **`main`** — production. Auto-deploys on every push (via `.github/workflows/deploy.yml`).
- **`draft`** — staging. Identical setup to `main`, but the workflow file ignores it.

Short-lived branches like `chore/<thing>` or `feat/<thing>` are fine for bigger changes — base them off `draft`, merge them into `draft`, then merge `draft` into `main` when ready.

Don't push directly to `main` for content changes. Going through `draft` gives you a checkpoint to review what's about to go live.

## Snapshot before a risky change

Before any edit you might want to undo (redesigns, sweeping renames, dependency bumps, theme swaps), tag the current state:

```bash
git tag pre-<short-name>
# e.g. git tag pre-redesign
# e.g. git tag pre-tailwind-v5-bump
```

Tags are local until you push them. Keep them local — they're just bookmarks. To list:

```bash
git tag --list 'pre-*'
```

To delete a stale tag:

```bash
git tag -d pre-<short-name>
```

This pattern is enforced by convention only (hooks don't require tags). It costs nothing and saves entire afternoons.

## Reverting

### Undo the last commit (not yet pushed)

```bash
git reset --soft HEAD~1     # keeps changes staged, lets you re-commit
# OR
git reset --hard HEAD~1     # discards changes entirely (DESTRUCTIVE)
```

### Undo the last commit (already pushed to draft)

`draft` is yours; force-pushing it is fine.

```bash
git reset --hard HEAD~1
git push --force-with-lease origin draft
```

### Undo a commit on main (already deployed)

The clean way is a *new* commit that inverts the bad one — the live site rebuilds from the new state, history stays linear:

```bash
git checkout main
git revert <bad-commit-sha>
git push origin main
```

Use `git reset --hard` on `main` only if absolutely necessary, and be explicit about it. The `pre-push` hook will warn you when you try.

### Roll back to a tag

If things are very wrong and you want to return to a known-good state:

```bash
git checkout main
git reset --hard pre-<tag-name>
git push --force-with-lease origin main
```

The hook will warn first. Confirm by re-running. The site rebuilds from whatever is at the tag.

### Revert a single file (keep everything else)

```bash
git checkout <commit-sha-or-tag> -- path/to/file
git commit -m "fix: revert path/to/file to <commit>"
```

## The `pre: snapshot` rule (from global CLAUDE.md)

Before any multi-file edit or risky change in *any* repo, the user's global rule is to commit current state:

```bash
git add -A && git commit -m "pre: snapshot"
```

These commits are **local only**. The `pre-push` hook blocks them from reaching GitHub — when you're ready to publish, squash them first:

```bash
# count the pre: commits to squash
git log --oneline | head
# then interactive rebase, or this fast path:
git reset --soft <last-real-commit>
git commit -m "<your real message>"
```

## Commit-message prefixes (enforced by `commit-msg` hook)

`feat | fix | refactor | docs | test | chore | init | pre | style | perf | ci | post`

Any other prefix is rejected. See [content-workflow.md](content-workflow.md) for when to use each.

## What NOT to do

- Don't `git push --force` to `main` without `--force-with-lease`. (Hook blocks the bare `--force` form.)
- Don't push commits whose author email is your real address. (`pre-commit` hook blocks.)
- Don't commit `dist/`, `node_modules/`, `.env`, or anything containing `secret`/`token` in the filename. (`pre-commit` hook blocks.)
- Don't push `pre: snapshot` commits to remote. (`pre-push` hook blocks. Squash first.)
- Don't edit content directly on `main`. (Convention only — no hook for this. Use `draft`.)

For the full list of safeguards, see [safeguards.md](safeguards.md).
