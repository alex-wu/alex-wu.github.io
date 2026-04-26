# alex-wu.github.io — Astro Micro setup

Concise, executable. Decisions locked: username `alex-wu`, repo `alex-wu.github.io`, framework Astro Micro, no custom domain (add later in 15 min).

End state: live site at `https://alex-wu.github.io`, auto-deploys on `git push`.

---

## 0. Prereqs (Windows, Git Bash)

```bash
node --version    # >= v22
npm --version
git --version
```

If Node < 22, install via Volta: `volta install node@22`.

GitHub auth: this guide uses HTTPS. On first `git push`, Git Credential Manager opens a browser to sign you in — no SSH key setup needed.

Working dir: `D:\Dev\Github\alex-portfolio` (folder name is local-only; remote repo MUST be `alex-wu.github.io`).

---

## 1. Clone template into cwd

`git clone` needs an empty target. Stash the existing guide aside, clone, restore:

```bash
mkdir -p /d/tmp
mv setup-guide.md /d/tmp/
git clone --depth 1 https://github.com/trevortylerlee/astro-micro.git .
rm -rf .git
mv /d/tmp/setup-guide.md ./
git init
git branch -M main
```

---

## 2. Install + verify locally

```bash
npm install
npm run dev
```

Open http://localhost:4321 → confirm template renders. `Ctrl+C` to stop.

---

## 3. Configure for alex-wu

### 3a. `astro.config.mjs`

Set:
```js
site: "https://alex-wu.github.io",
```
Do **not** set `base` — user sites serve from root.

### 3b. Site metadata — `src/consts.ts`

Edit SITE.TITLE, SITE.DESCRIPTION, SITE.EMAIL, HOME.TITLE/DESCRIPTION, BLOG, PROJECTS, and SOCIALS (replace template's GitHub/Website/Twitter URLs with your own — or remove entries you don't have).

Real schema:
```ts
export const SITE: Site = {
  TITLE: "Alex Wu",
  DESCRIPTION: "One-line positioning statement.",
  EMAIL: "alex.w.w.h@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};
// HOME / BLOG / PROJECTS — edit titles/descriptions
// SOCIALS — replace with your accounts
```

Collections: only `blog` and `projects` (no `work`).

---

## 4. Keep template content for first deploy

Template ships with sample posts in `src/content/blog/` and `src/content/projects/`. Leave them — the site renders clean. Replace with your own content after the first successful deploy.

---

## 5. Build locally — must pass

```bash
npm run build
```

Exit 0 = ready to push. If it fails, fix before continuing.

---

## 6. Add deploy workflow

```bash
mkdir -p .github/workflows
```

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 7. Create remote repo (web UI)

1. Open https://github.com/new
2. Repository name: **`alex-wu.github.io`** (exact)
3. Public
4. Do NOT add README, .gitignore, or license
5. Create

---

## 8. First push

```bash
git add -A
git commit -m "init: astro micro"
git remote add origin https://github.com/alex-wu/alex-wu.github.io.git
git push -u origin main
```

---

## 9. Enable Pages (web UI)

1. Open `https://github.com/alex-wu/alex-wu.github.io/settings/pages`
2. Source: **GitHub Actions**

---

## 10. Watch deploy

Open the Actions tab on the repo. First run ~2 min. When green:

```
https://alex-wu.github.io
```

is live.

---

## Daily workflow

```bash
# edit src/content/blog/whatever.md
npm run dev          # preview at localhost:4321
git add -A
git commit -m "post: title"
git push             # live in ~90s
```

---

## Later (when you're ready)

- **Custom domain**: buy → add DNS A/AAAA records → `echo yourdomain.com > public/CNAME` → update `site:` in `astro.config.mjs` → push → Settings/Pages → enter domain → enable HTTPS. ~15 min.
- **Subprojects** (Quarto / Observable / Power BI): each in its own repo named e.g. `dataviz`, deploys to `alex-wu.github.io/dataviz/`. Subprojects need a `base` config matching the repo name; this hub repo does not.
- **CMS**: drop in Keystatic later — uses the same `src/content/` markdown files.

---

## Anti-patterns

- Don't commit `node_modules/` or `dist/` (gitignored).
- Don't set `base:` in this `astro.config.mjs` — it's a user site, served from root.
- Don't force-push `main` — breaks cached links.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Action fails on install | Delete `package-lock.json`, `npm install` locally, commit new lockfile, push |
| Site builds but CSS missing | Check `dist/.nojekyll` exists after `npm run build` (Astro action adds automatically) |
