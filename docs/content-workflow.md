# Content workflow

Everyday loop for adding, editing, or drafting content. The site has two collections: `blog` and `projects`. Schemas live in `src/content.config.ts`.

## TL;DR

```bash
git checkout draft                        # 1. always start here, never edit on main
# create or edit a .md/.mdx file in src/content/blog/ or src/content/projects/
npm run dev                               # 2. preview at http://localhost:4321
npm run build                             # 3. gate — must exit 0
git add -A
git commit -m "post: <slug>"              # 4. conventional prefix; hook enforces it
git push origin draft                     # 5. lands on draft branch — does NOT deploy
git checkout main
git merge draft --ff-only
git push origin main                      # 6. THIS publishes — live in ~90s
```

## Branches

- **`main`** = production. Every push to `main` deploys to https://alex-wu.github.io. Don't edit content directly on `main`.
- **`draft`** = staging. Pushes to `draft` go to GitHub but **do not deploy**. The Actions workflow only fires on `main`.

If you accidentally start editing on `main`, the easy fix is:

```bash
git stash
git checkout draft
git stash pop
```

## Frontmatter — what each collection accepts

Authoritative source: `src/content.config.ts`. Reproduced here for quick reference.

### `src/content/blog/<slug>.md` (or `<slug>/index.md`)

```yaml
---
title: "Required string"
description: "Required string. Shown on the listing page and in social cards."
date: "2026-04-26"          # required; sort key
draft: false                # optional; true = hidden from production listings
tags: ["optional", "tag", "list"]
---
```

- Sort order is by **`date` field**, not by filename. Folder prefixes like `01-`, `02-` are organizational only.
- `draft: true` is filtered manually in `src/pages/blog/index.astro` and `src/pages/blog/[...id].astro`. If you add a new page that lists posts, replicate the `.filter(p => !p.data.draft)` line or drafts will leak.
- Each tag in `tags: []` auto-creates a page at `/tags/<tag>/`. No registration needed.

### `src/content/projects/<slug>.md`

```yaml
---
title: "Required string"
description: "Required string"
date: "2026-04-26"          # required
draft: false                # optional
demoURL: "https://..."      # optional
repoURL: "https://..."      # optional
---
```

## Images

- Drop image files anywhere under `src/` and `import` them in components or MDX. Astro's `astro:assets` pipeline resizes, converts to webp, and content-hashes the filename automatically.
- Files in `public/` are served raw with no optimization. Use only for `favicon.svg`, `CNAME`, `robots.txt`.

## Common operations

### Add a new published blog post

```bash
git checkout draft
$EDITOR src/content/blog/my-new-post.md
# write frontmatter + body
npm run build
git add src/content/blog/my-new-post.md
git commit -m "post: my new post"
git push origin draft
# preview rendered version locally with `npm run dev` if you haven't
git checkout main && git merge draft --ff-only && git push origin main
```

### Save a half-finished post in the repo without publishing

Set `draft: true` in the frontmatter. Commit and push to `draft` (or even `main`) freely — production listings will skip it.

### Edit an existing post

Same flow as adding. Commit message: `post: update <slug>`. If the edit is small (typo fix), `fix: typo in <slug>` is also fine.

### Delete a post

```bash
git checkout draft
git rm src/content/blog/<slug>.md          # or `git rm -r` for folder posts
git commit -m "chore: remove <slug>"
git push origin draft
# merge to main when ready
```

### Add a project card

Same as blog but in `src/content/projects/`. `demoURL` and `repoURL` are optional; the card hides them gracefully if absent.

## Commit-message prefixes (enforced by hook)

| Prefix | When to use |
|---|---|
| `post:` | Adding or updating content (blog post, project entry) |
| `fix:` | Bug fix in code or content |
| `feat:` | New feature or section |
| `refactor:` | Code change with no behavior change |
| `docs:` | Changes under `docs/`, `README.md`, `CLAUDE.md`, etc. |
| `chore:` | Config tweaks, dependency bumps, file moves |
| `style:` | CSS/Tailwind/visual-only changes |
| `test:`, `perf:`, `ci:`, `init:` | Self-explanatory; rarely needed for a content site |
| `pre:` | **Local-only snapshot before a risky change.** Never push to remote. |

The `commit-msg` hook will reject any commit whose message doesn't start with one of these.

## When something goes wrong

- `astro check` failed on schema → match your frontmatter to `src/content.config.ts`.
- Pushed to `draft` but expected a deploy → that's correct. `draft` doesn't deploy. Merge to `main` to publish.
- Pushed to `main` and the change is bad → see [git-workflow.md](git-workflow.md) "Reverting" section.
- Hook blocked your commit → read the message; it tells you exactly what to do.
