# Personal OS — kh1emnguyen.github.io/personal-os/

Mission control for Khiem Nguyen's tools, projects, and internal apps.

## Routes

| Route | Description |
|---|---|
| `/` | Homepage card grid — OS launchpad |
| `/writing` | Writing Dashboard (embedded, Supabase-backed) |
| `/anti-rut` | Anti-Rut app — Sanctuary + Mirror |

## Stack

- React 18 + Vite 5
- `react-router-dom` v6 (client-side routing, hash-based for GitHub Pages)
- Supabase JS client (Writing Dashboard)
- Web Speech API (Anti-Rut Sanctuary narration)
- GitHub Actions → GitHub Pages

## Anti-Rut Content Pipeline

Weekly content updates are managed via Claude Code Routine (every Sunday 9pm AEST).

The Routine reads `Second Brain/` journals from the past 7 days, extracts recurring themes and named mantras, and regenerates `public/anti-rut-content.json`. Changes are auto-committed with the message `content: weekly mantra update [YYYY-MM-DD]`.

To manually update content: edit `public/anti-rut-content.json` directly, changing the `week` field and the `mantras` array. Each mantra needs `id`, `text`, and `source`.

## Local Dev

```bash
npm install
npm run dev
```

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically to GitHub Pages.

Requires: Settings → Pages → Source: GitHub Actions.
