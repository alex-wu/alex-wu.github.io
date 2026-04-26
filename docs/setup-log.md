# Setup log — what actually happened

Record of the bootstrap session on 2026-04-26. Captures deviations from `setup-guide.md` and decisions that aren't obvious from the code.

## Decisions locked

| Item | Value | Why |
|---|---|---|
| GitHub username | `alex-wu` | Existing account |
| Repo name | `alex-wu.github.io` | Required for GitHub Pages user-site magic URL |
| Local folder | `D:\Dev\Github\alex-portfolio` | Doesn't have to match repo name |
| Framework | Astro Micro (Trevor Tyler Lee fork of Astro Nano) | Picked over plain HTML / Jekyll |
| Custom domain | None yet | Can add in 15 min later — no rebuild needed |
| Node | v24.15.0 (Volta) | v22 LTS recommended; v24 worked without changes |
| Auth method | HTTPS + Git Credential Manager | No SSH key was set up for GitHub on this machine |

## Deviations from the original guide

1. **Schema mismatch.** Old guide referenced a `SITE.NAME` field, a `work` content collection, and a `NUM_WORKS_ON_HOMEPAGE` count. The current Astro Micro template (commit cloned 2026-04-26) has none of those — only `SITE.TITLE`, and only `blog` + `projects` collections. `setup-guide.md` was updated to match the real schema.
2. **Clone target wasn't empty.** The folder already contained `setup-guide.md` (and a pre-snapshot `.git`), so `git clone --depth 1 ... .` couldn't run directly. Workaround: clone Astro Micro into a sibling temp dir `D:\Dev\Github\astro-micro-tmp`, `rm -rf .git` inside it, then `mv * ... && rmdir` to merge contents into the cwd while preserving our own `.git` and the guide.
3. **WSL → Windows native.** Original guide assumed AlmaLinux WSL with nvm. We ran everything on Windows native (Git Bash + Volta-managed Node). All commands work in Git Bash; no WSL needed.
4. **`gh` CLI not installed.** Old guide had a `gh repo create` shortcut. Skipped — created the remote via the GitHub web UI instead.

## Gotchas hit (and the fixes)

### Git identity not configured

`git commit` failed on first run because `user.name`/`user.email` were not set anywhere. Fixed by setting **repo-local only** (not `--global`, per the user's `~/.claude/CLAUDE.md` rule):

```bash
git config user.email "[redacted]"             # initial — replaced below
git config user.name "Alex Wu"
```

### GitHub email-privacy guard rejected the push

```
remote: error: GH007: Your push would publish a private email address.
```

GitHub's "Block command line pushes that expose my email" setting refuses any commit authored with the user's real address. **Fix used:** rewrote the two local commits' author email with `git filter-branch`, replacing it with the GitHub-provided no-reply form `<id>+<username>@users.noreply.github.com`:

```bash
git config user.email "3050328+alex-wu@users.noreply.github.com"
git -c filter-branch.disableEnvFilterWarning=1 filter-branch -f --env-filter '
  export GIT_AUTHOR_EMAIL="3050328+alex-wu@users.noreply.github.com"
  export GIT_COMMITTER_EMAIL="3050328+alex-wu@users.noreply.github.com"
  export GIT_AUTHOR_NAME="Alex Wu"
  export GIT_COMMITTER_NAME="Alex Wu"
' main
```

The numeric ID `3050328` came from `https://api.github.com/users/alex-wu`. Future commits use the noreply email automatically because the repo-local `user.email` config is now set to that.

**Why not the alternative** (disable the privacy guard at github.com/settings/emails): would have published the real email forever in the public commit log.

### `git filter-branch` blocked by hook

A user hook denies history rewrites by default. Required explicit user confirmation before the rewrite ran. Future history rewrites in this repo will trip the same hook — expect a confirmation prompt.

## Successful build/deploy markers

- `npm install` — 474 packages, 34s, 20 vulnerabilities reported (typical for an Astro template; ignored)
- `npm run build` — 20 pages built in 6s, exit 0
- First Actions run: `Deploy to GitHub Pages` → completed / success
- `curl -sI https://alex-wu.github.io` → `HTTP/1.1 200 OK`
- Page title: `Home | Alex Wu` (confirms branding override took effect)

## Open items / future-me to-dos

- Replace the template's sample posts in `src/content/blog/` (`00-micro-changelog` ... `08-prev-next-order-example`) and `src/content/projects/` (`project-1`...`project-3`) with real content. They're harmless until then but signal "fresh template" to anyone visiting.
- Add real `SOCIALS` entries in `src/consts.ts` (currently only GitHub).
- 20 npm vulnerabilities reported; before any major content push, check `npm audit` and decide whether to bump deps.
- If buying a domain later, follow the "Later" section in `setup-guide.md` — DNS records + `public/CNAME` + `astro.config.mjs site:` update.
