# Davor Mulalić — Personal Website

Professional website of Davor Mulalić, C-Level AI Leader:
https://mulalic.ai-studio.wiki

Governed by [Commander](https://github.com/IDSS123a/commander) — start with
`CLAUDE.md`, then `CONSTITUTION.md` (project rules and Director decisions) and
the current sprint in `sprints/`.

## Stack (PDL-001)

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript (strict), Tailwind, shadcn/ui, framer-motion |
| Backend | Supabase project `qixpdeqjrkvfurqhzvtc` — Postgres (RLS), Auth, Storage, Edge Functions |
| AI chatbot | Gemini (`gemini-2.5-flash`) behind `supabase/functions/_shared/ai/` |
| Email | Resend API |
| Hosting | Vercel (+ Vercel Web Analytics) |

## Where things live

| What | Where |
|---|---|
| Every fact about Davor (single source of truth) | `src/content/profile.ts` |
| Chatbot knowledge (generated from profile.ts) | `src/content/knowledge.ts` |
| Validation schemas (browser + Edge Functions) | `src/lib/validation/schemas.ts` |
| Calls to Edge Functions | `src/lib/api.ts` |
| Edge Functions | `supabase/functions/*` |
| Database schema | `supabase/migrations/` |

## Local development

```sh
npm install
cp .env.example .env   # fill in the two public values
npm run dev            # http://localhost:8080
```

Checks before every commit:

```sh
npx tsc --noEmit -p tsconfig.app.json
npm run lint
npm run build
node .claude/hooks/project-guard.js --scan
```

## Backend operations (Supabase CLI, linked to the project)

```sh
supabase db push --linked                      # apply new migrations
supabase functions deploy <name> --use-api     # deploy one Edge Function
supabase secrets set NAME=value                # server-side secrets
```

Edge Function secrets: `GEMINI_API_KEY_1`, `RESEND_API_KEY`, `EMAIL_FROM`,
optional `RESEND_WEBHOOK_SECRET`. The admin role is assigned by SQL only —
public sign-up is disabled.
