# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site at **https://alex-wu.github.io**. Built on the [Astro Micro](https://github.com/trevortylerlee/astro-micro) template (fork of Astro Nano). Deployed via GitHub Actions to GitHub Pages on every push to `main`.

The local folder is `D:\Dev\Github\alex-portfolio` but the **remote repo MUST be named `alex-wu.github.io`** — that's the GitHub Pages "user site" magic name that unlocks the clean root URL with no subpath. Do NOT set `base` in `astro.config.mjs` — user sites serve from `/`.

## Commands

```bash
npm run dev               # local dev at http://localhost:4321
npm run build             # astro check + astro build → dist/
npm run preview           # serve dist/ locally
git push origin draft     # stages on draft branch — does NOT deploy
git push origin main      # = deploy. Workflow rebuilds + publishes in ~90s
```

There is no test suite. `npm run build` is the gate (it includes `astro check` for type errors).

## Workflow

Edits go through `draft` → `main`. Hooks are active locally and enforce conventional commit prefixes, block real-email commits, block accidental `dist/`/secret commits, and block `pre: snapshot` commits from being pushed.

- `docs/content-workflow.md` — adding/editing/drafting posts
- `docs/git-workflow.md` — branching, snapshots, reverting
- `docs/safeguards.md` — what each hook enforces, how to install, exit criteria for merging into main
- `bash scripts/install-hooks.sh` — activate hooks on a fresh clone (idempotent)

## Architecture

Astro 5 + Tailwind 4 + MDX. Static SSG, no client-side framework. Pagefind for search (built at build-time, no backend).

- `src/content/` — content collections defined in `src/content.config.ts`. Two collections: `blog` and `projects` (no `work`). Schemas use Zod; adding a frontmatter field means editing both `content.config.ts` and the matching template that reads it.
- `src/pages/` — file-based routing. `[...id].astro` files are dynamic routes that read from collections via `getCollection()`.
- `src/components/` — Astro components (`.astro`). `Head.astro`, `Header.astro`, `Footer.astro` wrap every page via `src/layouts/Layout.astro`.
- `src/consts.ts` — site-wide config: SITE (TITLE/EMAIL/post counts), HOME/BLOG/PROJECTS metadata, SOCIALS array. Editing this is usually faster than chasing strings through components.
- `src/styles/global.css` — **Tailwind 4 syntax**: uses `@import 'tailwindcss'`, `@plugin`, `@theme`, `@custom-variant` — NOT v3's `@tailwind base/components/utilities` directives. Pasting v3 snippets here will silently break styles. Shiki code-block colors are driven by the CSS vars defined in this file (theme set to `css-variables` in `astro.config.mjs`), so dark/light/system theme toggle changes both UI and code blocks together.
- `src/types.ts` — TypeScript types (`Site`, `Metadata`, `Socials`) imported by `src/consts.ts`. Adding a new field to `SITE` means updating both files.
- `astro.config.mjs` — `site` is hardcoded to `https://alex-wu.github.io`. If a custom domain is added later, update this string AND drop a `public/CNAME` file.
- `.github/workflows/deploy.yml` — uses `withastro/action@v3` (defaults: Node 22, npm) + `actions/deploy-pages@v4`. Triggers on push to `main` and manual `workflow_dispatch`.

## Git / deploy gotchas

- **Email privacy**: GitHub blocks pushes whose commits expose private emails. Repo-local git config is set to `3050328+alex-wu@users.noreply.github.com` for this reason. Don't override it with a real email.
- **Auth**: pushes use HTTPS via Git Credential Manager (browser-based OAuth). No SSH key configured for GitHub on this machine.
- **No `gh` CLI** installed — for repo/PR/Actions work, use `curl https://api.github.com/...` or the GitHub web UI.
- **Pre-commit snapshots**: per global `~/.claude/CLAUDE.md`, snapshot before risky/multi-file edits with `git add -A && git commit -m "pre: snapshot"`.

## Working with content

To add a blog post: drop a `.md` (or `.mdx`) into `src/content/blog/` (top-level file or subfolder with `index.md` — both work). Frontmatter must match the Zod schema in `src/content.config.ts`:

- blog: `title`, `description`, `date` (string coerced to Date), optional `draft` (bool), optional `tags` (string[])
- projects: `title`, `description`, `date`, optional `draft`, optional `demoURL`, optional `repoURL`

Two non-obvious behaviors:

- **Posts are sorted by `date` frontmatter**, not by filename or folder name. Folder-name prefixes like `01-`, `02-` in the template are organizational only — sort order ignores them.
- **`draft: true` is filtered manually** by each listing page via `.filter(p => !p.data.draft)` (see `src/pages/blog/index.astro` and `src/pages/blog/[...id].astro`). It's a convention, not a framework feature — if you add a new page that lists posts, replicate the filter or drafts will leak.

Tags are auto-routed: any string in a post's `tags: []` becomes a page at `/tags/<tag>/` via `src/pages/tags/[...id].astro`. No manual registration.

## When something breaks

- `astro check` failing on content schema → check `src/content.config.ts` matches the frontmatter you wrote
- CSS missing in production → confirm `dist/.nojekyll` exists after build (the Astro action adds it automatically)
- Workflow fails on install → delete `package-lock.json`, rerun `npm install` locally, commit the new lockfile, push
- Push rejected for email privacy → never bypass with `--no-verify` or by making email public; rewrite the offending commits' author with the noreply email instead

## Images

- Drop image files anywhere under `src/` and `import` them in components — Astro's `astro:assets` pipeline optimizes them (resize, webp conversion, content-hashed filenames).
- Files in `public/` are served raw with no optimization — use only for `favicon.svg`, `CNAME`, `robots.txt`, and similar fixed-path assets.

## Reference

- `docs/README.md` — index for all maintenance docs.
- `docs/setup-guide.md` — the one-time bootstrap walkthrough (Windows, Git Bash, no SSH, Astro Micro template). Not part of the build.
- `docs/setup-log.md` — historical session log: locked decisions, deviations from the generic guide, the exact commands that resolved the GH007 email-privacy block. Read first if a similar issue resurfaces.
