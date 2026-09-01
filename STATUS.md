# Project status

**Last updated:** 2026-08-31 · **Stage:** Phase 0 of [ROADMAP.md](ROADMAP.md) complete. Committed, building clean, notifications shipped.

Kausal Sangam is a skill-swap marketplace built from scratch in one session. Every screen in the
core loop — register, browse, propose a swap, accept, chat, complete, review — is implemented and
has been exercised against a live database.

---

## Snapshot

| | |
| --- | --- |
| Source files | 45 (`src/` + `prisma/`) |
| Lines of code | ~3,500 |
| Runtime dependencies | 8 |
| Database tables | 6 |
| Rows in local DB | 9 users (8 seeded + 1 registered by hand), 17 skills, 6 swaps |
| Git | 5 commits, working tree clean, no remote configured yet |
| Tests | none |

---

## What is built

### Done and exercised against the running app

- **Registration and sign-in.** Email + password, bcrypt at 12 rounds, JWT session cookie.
  A real account was registered through the UI and used for everything below.
- **Profile editing.** Name, headline, bio, city, avatar URL.
- **Skill management.** Add and remove skills, tagged `OFFER` or `WANT`, with a level on offers.
  Typing a skill that already exists reuses it (upsert by slug) instead of creating a duplicate.
- **Browse and search.** Free-text across name, headline, bio and skill names; filter by city and
  by a specific skill.
- **Member profiles.** Public page showing offers, wants, rating and completed-swap count, plus the
  propose-a-swap form.
- **Swap lifecycle.** Propose → accept or decline → complete, or cancel. Status transitions are
  enforced server-side, not just hidden in the UI.
- **Messaging.** A thread scoped to one swap, unlocked once the swap is accepted.
- **Reviews.** One per participant per completed swap; feeds the average rating on a profile.
- **Dashboard.** Incoming, outgoing, active and past swaps in one place.
- **Light and dark themes.** One token set, redefined once under `prefers-color-scheme`.
- **In-app notifications.** A header bell with a count, and `/notifications` listing swap requests
  waiting on you and unread message threads. Opening a swap marks its messages read. Derived from
  `SwapRequest.status` and the previously unused `Message.readAt` — no new tables.

### Built but not independently verified

- The `db:reset` path — the volume has not been destroyed and rebuilt from scratch since seeding.
- Notification counts under concurrency — the header badge still includes a thread on the render
  where you open it, because layout and page render at the same time. It clears on the next
  navigation. Verified visually; not load-tested.

### Not started

- Automated tests of any kind.
- Pagination — browse hard-caps at 60 results.
- Email notifications (in-app ones now exist).
- Rate limiting on registration and messaging.
- Avatar URL host validation; remote URLs are rendered as-is.
- Moderation, reporting, admin tooling.
- OAuth providers, session scheduling, skill categories in the browse filter.

---

## Decisions made, and why

| Decision | Reasoning |
| --- | --- |
| Server Actions instead of a REST/tRPC layer | No second API surface to build, secure and keep in step with the UI. |
| Server Components for reads | Queries run next to the database; no client cache to invalidate. |
| Prisma pinned to `7.10.0` | npm's `latest` tag currently resolves to `8.0.0-rc.12`, a release candidate. The pin is deliberate — revisit when 8.0 ships stable. |
| `next-auth@5.0.0-beta.32` | The only line declaring Next 16 support. Session access is funnelled through two helpers in `src/auth.ts`, so replacing it touches two files. |
| Postgres in Docker, not SQLite | Dev matches production. Case-insensitive search and filtered relation counts behave identically. |
| npm, not yarn | `corepack enable` fails with `EPERM` on this machine (needs an elevated shell). The original setup notes said yarn; nothing depends on it. |
| Tailwind v4 tokens over a component library | One palette drives both themes; no unused component weight. |

---

## Environment gotchas hit along the way

Worth knowing before anyone tries to rebuild this from cold.

- **`create-next-app` rejects the folder name.** `Kausal Sangam` has a capital letter and a space,
  which npm package names forbid. The app was scaffolded elsewhere as `kausal-sangam` and moved in.
  The `name` field in `package.json` stays `kausal-sangam`.
- **Next 16 renamed `middleware.ts` to `proxy.ts`.** Same behaviour, different filename. Next 16's
  bundled docs live in `node_modules/next/dist/docs/` and are the source of truth over training data.
- **Prisma 7 requires a driver adapter.** `DATABASE_URL` is no longer picked up implicitly —
  `src/lib/prisma.ts` constructs `PrismaPg` explicitly.
- **Docker Desktop must be running before `npm run db:up`.** The daemon does not start on login here;
  when it is down, `docker` commands fail with a named-pipe error and the dev server dies with it.
- **`corepack enable` needs an elevated shell.** Hence npm.

---

## Where the last session stopped

Phase 0 closed out. The tree is committed in five commits, `npm run build`, `typecheck` and
`lint` all pass, and notifications were verified in the browser against seeded data: the bell
counted 2 for `sneha@example.com` (one pending request, one unread thread), dropped to 1 after
opening the swap, and showed the caught-up empty state for a member with nothing waiting.

**No git remote is configured.** Pushing to `github.com/srikrishnasai/kausal-sangam` is blocked —
see the note at the end of this file.

---

## Resuming from cold

```bash
# 1. Docker Desktop must be running first
npm run db:up
npm run dev
```

If the database is empty or the schema has drifted:

```bash
npm run db:push
npm run db:seed
```

Seeded accounts all use the password `password123` — see the table in [README.md](README.md).

---

## Suggested next steps, in order

Phase 0 is done. Next up is [Phase 1](ROADMAP.md), all four items of which are read-side work on
data that already exists:

1. **1.1 Skill category filter on Browse** — `Skill.category` is populated by the seed and unused
   by the UI.
2. **1.2 Pagination on Browse** — a "Load more" button first; the 60-row cap is currently silent.
3. **1.3 Skill level on profiles** — `UserSkill.level` is stored and never rendered.
4. **1.4 Post-swap reflection prompt** — placeholder copy on the existing review comment box.

Outside the roadmap, still worth doing: **tests around the swap state machine** (the most branching
in the codebase), **rate limiting** before this is exposed beyond localhost, and **avatar host
validation**.

---

## Pushing to GitHub

`git ls-remote https://github.com/srikrishnasai/kausal-sangam.git` returns *Repository not found*,
and the `gh` CLI is not installed on this machine. Either the repository does not exist yet or it
is private and this machine is unauthenticated.

To push once it exists and you are authenticated:

```bash
git remote add origin https://github.com/srikrishnasai/kausal-sangam.git
git branch -M main
git push -u origin main
```
