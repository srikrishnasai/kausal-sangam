# Kausal Sangam

**कौशल संगम — a confluence of skills.** A skill-swap marketplace: members list what they can
teach and what they want to learn, find a fair trade, agree the details in chat, and review each
other afterwards. No money, no credits — just a two-way trade.

> **Status:** working prototype, running locally. Every screen in the core loop is implemented and
> has been exercised against a live database. See **[STATUS.md](STATUS.md)** for what is built,
> what is only assumed to work, and what comes next.

## Stack

| Layer    | Choice                                                  |
| -------- | ------------------------------------------------------- |
| Framework| Next.js 16 (App Router, React 19, Server Actions)        |
| Language | TypeScript                                              |
| Styling  | Tailwind CSS v4 (CSS-variable theme, light + dark)      |
| Database | PostgreSQL 17 via Docker                                |
| ORM      | Prisma 7 with the `@prisma/adapter-pg` driver adapter    |
| Auth     | Auth.js v5 (`next-auth`), credentials + JWT sessions     |
| Validation | Zod 4                                                 |

## Prerequisites

- **Node.js 22+** and npm. (yarn is not used — `corepack enable` needs an elevated shell on Windows.)
- **Docker Desktop, running.** It does not start on login by default; if `npm run db:up` fails with
  a named-pipe error, launch Docker Desktop and retry.

## Quick start

```bash
npm install
cp .env.example .env    # then set AUTH_SECRET / NEXTAUTH_SECRET
npm run db:up           # starts PostgreSQL in Docker
npm run db:push         # creates the schema
npm run db:seed         # optional: 8 demo members, skills and swaps
npm run dev
```

The app runs at http://localhost:3000. Docker Desktop must be running before `db:up`.

Generate a secret with:

```bash
openssl rand -base64 32
```

### Demo logins

Every seeded account uses the password `password123`:

| Email                 | Teaches                        | Wants                     |
| --------------------- | ------------------------------ | ------------------------- |
| `ananya@example.com`  | Carnatic Vocals, Python        | Pottery, Spanish          |
| `rahul@example.com`   | Guitar, Photography            | Python, Bread Baking      |
| `sneha@example.com`   | Bread Baking, Watercolour      | Guitar, Yoga              |
| `imran@example.com`   | Tabla, Urdu Poetry             | Photography, React        |
| `vikram@example.com`  | React, TypeScript              | Tabla, Public Speaking    |

Also seeded: `priya@`, `meera@` and `daniel@example.com`.

## Scripts

| Script             | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `npm run dev`      | Dev server                                            |
| `npm run build`    | Production build                                      |
| `npm run typecheck`| `tsc --noEmit`                                        |
| `npm run lint`     | ESLint                                                |
| `npm run db:up`    | Start the Postgres container                          |
| `npm run db:down`  | Stop it (data is kept in a named volume)              |
| `npm run db:reset` | Destroy the volume and start fresh                    |
| `npm run db:push`  | Sync `prisma/schema.prisma` to the database           |
| `npm run db:seed`  | Wipe and reseed demo data                             |
| `npm run db:studio`| Prisma Studio                                         |

`prisma generate` runs automatically on `npm install` (postinstall).

## How the app is laid out

```
prisma/
  schema.prisma      data model
  seed.ts            demo data
src/
  auth.ts            Auth.js config + currentUser() / requireUserId() helpers
  proxy.ts           optimistic route gate (Next 16 renamed middleware to proxy)
  app/
    page.tsx         landing
    browse/          search and filter members
    members/[id]/    public profile + propose-a-swap form
    dashboard/       incoming, outgoing, active and past swaps
    dashboard/profile/  edit details, manage skills
    swaps/[id]/      one swap: status actions, chat, reviews
    actions/         server actions (auth, profile, swaps, messages, reviews)
    api/auth/[...nextauth]/  Auth.js route handler
  components/        UI primitives, forms, cards
  lib/               prisma client, zod schemas, form helpers, utils
  generated/prisma/  Prisma client output (gitignored)
```

### Data model

- **User** — profile, plus `UserSkill` rows.
- **Skill** — shared catalogue; new names are upserted by slug when a member types one.
- **UserSkill** — joins a user to a skill with `kind` (`OFFER` / `WANT`) and, for offers, a level.
- **SwapRequest** — requester, recipient, the skill requested, the skill offered in return, a
  note, and a status (`PENDING → ACCEPTED → COMPLETED`, or `DECLINED` / `CANCELLED`).
- **Message** — chat scoped to one swap; unlocked once the swap is accepted.
- **Review** — one per participant per completed swap; drives the rating on a profile.

### Security notes

- Every server action re-checks the session; `proxy.ts` is only an optimistic redirect so signed-out
  visitors do not render a dashboard shell.
- Ownership-scoped writes use `updateMany` / `deleteMany` with the owner in the `where` clause, so a
  forged id updates zero rows rather than someone else's data.
- Passwords are hashed with bcrypt (12 rounds). Sessions are JWTs signed with `AUTH_SECRET`.

## Not built yet

Ideas that fit the model but are out of scope for this first cut: email notifications, OAuth
providers, session scheduling with a calendar, skill categories in the browse filters, moderation
and reporting, and pagination once member counts grow past a page.

## Working on this

Conventions, pinned-version rationale and the traps specific to Next 16 and Prisma 7 are in
[AGENTS.md](AGENTS.md). Read it before adding a server action or a form.
