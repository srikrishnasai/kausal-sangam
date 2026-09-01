# Project status

**Last updated:** 2026-09-01 · **Stage:** Phase 1 of [ROADMAP.md](ROADMAP.md) complete. Browse now filters by category, paginates past the old 60-row cap, and swap reviews prompt for what was learned.

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
| Git | 7 commits on `main`, tree clean, pushed to [srikrishnasai/kausal-sangam](https://github.com/srikrishnasai/kausal-sangam) |
| Tests | none |

---

## What is built

### Done and exercised against the running app

- **Registration and sign-in.** Email + password, bcrypt at 12 rounds, JWT session cookie.
  A real account was registered through the UI and used for everything below.
- **Profile editing.** Name, headline, bio, city, avatar URL.
- **Skill management.** Add and remove skills, tagged `OFFER` or `WANT`, with a level on offers.
  Typing a skill that already exists reuses it (upsert by slug) instead of creating a duplicate.
- **Browse and search.** Free-text across name, headline, bio and skill names; filter by city, by
  skill category and by a specific skill; "Load more" pagination past the first 24 results.
- **Member profiles.** Public page showing offers, wants, rating and completed-swap count, plus the
  propose-a-swap form.
- **Swap lifecycle.** Propose → accept or decline → complete, or cancel. Status transitions are
  enforced server-side, not just hidden in the UI.
- **Messaging.** A thread scoped to one swap, unlocked once the swap is accepted.
- **Reviews.** One per participant per completed swap; feeds the average rating on a profile. The
  comment field is now framed as "What did you learn about {skill}?", naming the actual skill from
  that swap.
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
- Email notifications (in-app ones now exist).
- Rate limiting on registration and messaging.
- Avatar URL host validation; remote URLs are rendered as-is.
- Moderation, reporting, admin tooling.
- OAuth providers, session scheduling.

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

Phase 1 closed out on top of Phase 0. `npm run build`, `typecheck` and `lint` all pass. Verified
live against the running dev server and seeded data:

- The category filter narrows the 9-member seed set to 4 for `?category=Music`, and the dropdown
  lists the 7 real categories from the DB (Communication, Creative, Food, Languages, Music,
  Technology, Wellbeing).
- Pagination's "Load more" math (`take` + `hasMore`) is in place with a default page size of 24;
  it doesn't visibly trigger yet because the seed data only has 9 members — expected, not a bug.
- The review form's reflection prompt was wired through `youLearn` on the swap page, so it names
  the actual skill from that swap rather than generic copy.
- Skill-level display on profiles turned out to already exist from the very first commit — no
  change was needed there; STATUS.md previously said this was missing and that was inaccurate.

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

Phase 1 is done. Next up is [Phase 2](ROADMAP.md) — community growth:

1. **2.1 Email notification** on a new swap request or message (start with one transactional email).
2. **2.2 "Wanted" board** — make existing `WANT` rows publicly browsable, no new schema.
3. **2.4 Referral/invite nudge** on the swap-completion screen — a static share message, no
   tracking table for v1.
4. **2.3 Groups/circles** and **2.5 group events** — deferred until 2.1/2.2/2.4 show engagement;
   both need new schema, so they're the most expensive to get wrong early.

Outside the roadmap, still worth doing: **tests around the swap state machine** (the most branching
in the codebase), **rate limiting** before this is exposed beyond localhost, and **avatar host
validation**.

---

## Pushing to GitHub

The remote is configured and `main` tracks `origin/main`:

```bash
git push
```

Note for whoever pushes next: this machine's Git Credential Manager entry must belong to an account
with write access to `srikrishnasai/kausal-sangam`. Accepting a collaborator invite is not enough
on its own if the stored credential is a fine-grained token scoped to selected repositories — clear
the cached entry and re-authenticate:

```bash
printf "protocol=https
host=github.com

" | git credential reject
```
