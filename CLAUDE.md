# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site at **https://alex-wu.github.io**. Built on the [Astro Micro](https://github.com/trevortylerlee/astro-micro) template (fork of Astro Nano). Deployed via GitHub Actions to GitHub Pages on every push to `main`.

The local folder is `D:\Dev\Github\alex-portfolio` but the **remote repo MUST be named `alex-wu.github.io`** — that's the GitHub Pages "user site" magic name that unlocks the clean root URL with no subpath. Do NOT set `base` in `astro.config.mjs` — user sites serve from `/`.

## Commands

```bash
npm run dev          # local dev at http://localhost:4321
npm run build        # astro check + astro build → dist/
npm run preview      # serve dist/ locally
git push             # = deploy. Workflow rebuilds + publishes in ~90s
```

There is no test suite. `npm run build` is the gate (it includes `astro check` for type errors).

## Architecture

Astro 5 + Tailwind 4 + MDX. Static SSG, no client-side framework. Pagefind for search (built at build-time, no backend).

- `src/content/` — content collections defined in `src/content.config.ts`. Two collections: `blog` and `projects` (no `work`). Schemas use Zod; adding a frontmatter field means editing both `content.config.ts` and the matching template that reads it.
- `src/pages/` — file-based routing. `[...id].astro` files are dynamic routes that read from collections via `getCollection()`.
- `src/components/` — Astro components (`.astro`). `Head.astro`, `Header.astro`, `Footer.astro` wrap every page via `src/layouts/Layout.astro`.
- `src/consts.ts` — site-wide config: SITE (TITLE/EMAIL/post counts), HOME/BLOG/PROJECTS metadata, SOCIALS array. Editing this is usually faster than chasing strings through components.
- `src/styles/global.css` — Tailwind 4 imports + custom CSS variables for the shiki code theme.
- `astro.config.mjs` — `site` is hardcoded to `https://alex-wu.github.io`. If a custom domain is added later, update this string AND drop a `public/CNAME` file.
- `.github/workflows/deploy.yml` — uses `withastro/action@v3` (defaults: Node 22, npm) + `actions/deploy-pages@v4`. Triggers on push to `main` and manual `workflow_dispatch`.

## Git / deploy gotchas

- **Email privacy**: GitHub blocks pushes whose commits expose private emails. Repo-local git config is set to `3050328+alex-wu@users.noreply.github.com` for this reason. Don't override it with a real email.
- **Auth**: pushes use HTTPS via Git Credential Manager (browser-based OAuth). No SSH key configured for GitHub on this machine.
- **No `gh` CLI** installed — for repo/PR/Actions work, use `curl https://api.github.com/...` or the GitHub web UI.
- **Pre-commit snapshots**: per global `~/.claude/CLAUDE.md`, snapshot before risky/multi-file edits with `git add -A && git commit -m "pre: snapshot"`.

## Working with content

To add a post:

```bash
# new blog post
$EDITOR src/content/blog/<slug>.md
# frontmatter must match the schema in src/content.config.ts:
#   title (string), description (string), date (date), draft? (bool), tags? (string[])
```

The `draft: true` flag hides a post from production builds. The `08-prev-next-order-example` post in the template demos how `order` field controls navigation order.

## When something breaks

- `astro check` failing on content schema → check `src/content.config.ts` matches the frontmatter you wrote
- CSS missing in production → confirm `dist/.nojekyll` exists after build (the Astro action adds it automatically)
- Workflow fails on install → delete `package-lock.json`, rerun `npm install` locally, commit the new lockfile, push
- Push rejected for email privacy → never bypass with `--no-verify` or by making email public; rewrite the offending commits' author with the noreply email instead

## Reference

- `setup-guide.md` — the full one-time setup walkthrough used to bootstrap this repo. Keep for future reference; not part of the build.
