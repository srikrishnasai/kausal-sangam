<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Kausal Sangam

A skill-swap marketplace. Members list what they can teach and what they want to learn, propose a
two-way trade, chat, complete it, and review each other. No money, no credits.

Current state of the build is in [STATUS.md](STATUS.md). User-facing setup is in [README.md](README.md).

## Stack

Next.js 16.3.3 (App Router) · React 19.2.8 · TypeScript 5.9 · Tailwind CSS 4.3 ·
Prisma 7.10 with `@prisma/adapter-pg` · PostgreSQL 17 in Docker · Auth.js 5 beta · Zod 4 · npm.

Two versions are pinned on purpose — do not bump them casually:

- **`prisma` / `@prisma/client` at `7.10.0`.** npm's `latest` tag resolves to an `8.0.0-rc`.
- **`next-auth` at `5.0.0-beta.32`.** The only line declaring Next 16 support.

## Commands

```bash
npm run dev          # dev server (Docker must be up first)
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint

npm run db:up        # start postgres
npm run db:down      # stop it, keep the volume
npm run db:reset     # destroy the volume and start fresh
npm run db:push      # sync schema.prisma to the database
npm run db:seed      # wipe and reseed demo data
npm run db:studio    # browse data in a GUI
```

`prisma generate` runs on `postinstall`. Docker Desktop does not auto-start on this machine — if
`docker` fails with a named-pipe error, launch Docker Desktop and retry.

## Layout

```
prisma/schema.prisma     data model — the single source of truth
prisma/seed.ts           demo data
src/auth.ts              Auth.js config, currentUser(), requireUserId()
src/proxy.ts             optimistic route gate (Next 16's middleware)
src/lib/prisma.ts        Prisma client + PrismaPg adapter
src/lib/validators.ts    every Zod schema
src/lib/form.ts          server-action result helpers
src/app/actions/         all mutations, one file per domain
src/app/*/page.tsx       routes — server components
src/components/forms/    client components, one per form
src/components/ui/       button, card, badge, field, avatar
```

## Conventions to follow

**All mutations are server actions.** They live in `src/app/actions/`, never in route handlers.
The only route handler in the project is Auth.js's own catch-all.

**Every action re-checks the session itself.** `proxy.ts` only redirects signed-out visitors away
from signed-in pages — it is not the security boundary. A server action is reachable by direct POST,
so call `requireUserId()` inside the action.

**Scope writes by owner in the `where` clause.** Use `updateMany` / `deleteMany` with the owner id
included, so a forged id touches zero rows instead of someone else's data. Do not fetch, check in
JavaScript, then write.

**Re-validate cross-entity invariants server-side.** `createSwapRequestAction` re-confirms both
skills are actually on offer before writing. Dropdowns are convenience, not trust.

**One Zod schema per action, in `src/lib/validators.ts`.** The schema validates the submission and
types the action's input; do not hand-roll checks alongside it.

**Forms are client components using `useActionState`.** React 19 resets uncontrolled forms after an
action, so actions return the submitted values (minus passwords) and fields re-render from them.
Keep that echo when adding a form, or errors will clear the user's typing.

**Colours come from tokens in `globals.css`.** One palette, redefined once under
`prefers-color-scheme: dark`. Never hard-code a hex in a component, and never define a colour only
inside the dark block.

**New skills upsert by slug.** Typing "python" matches an existing "Python". New skills land in
category `Other`; nothing curates them yet.

## Traps

- `middleware.ts` does not exist in Next 16 — it is `src/proxy.ts`.
- Prisma 7 will not read `DATABASE_URL` implicitly; the adapter in `src/lib/prisma.ts` passes it.
- The generated Prisma client is at `src/generated/prisma/` and is gitignored. After changing
  `schema.prisma`, run `npm run db:push` (which regenerates) before expecting new types.
- `package.json` name is `kausal-sangam`; the folder is `Kausal Sangam`. npm forbids the latter as a
  package name. Do not "fix" one to match the other.
- Browse pagination is offset-based on purpose and can duplicate a card when someone registers
  mid-browse. It is a recorded, accepted limitation — see **Known and accepted** in
  [STATUS.md](STATUS.md). Do not file it as a new bug; if you fix it, fix it as cursor pagination.
- Browse filters both constrain the same `skill` relation. Merge them into one `skill` object —
  two spreads of `{ skill: ... }` silently drop the first, which shipped as a bug once already.
