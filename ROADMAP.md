# Roadmap

Prioritized by cost vs. impact, not by category. "Simpler alternative" is called out wherever a
smaller version gets most of the value without the full build.

Legend: **Effort** is rough, relative to the current codebase (schema already in `prisma/schema.prisma`,
patterns in `src/app/actions/`). No effort estimate implies it fits comfortably in an existing pattern.

---

## Phase 0 — Foundation (do before anything else below)

These aren't features; they're what every later item silently depends on.

**Status: complete (2026-08-31).**

| # | Item | Why first | Status |
|---|------|-----------|--------|
| 0.1 | Commit the working tree | Nothing is safely reversible until this happens | **Done** — 4 commits, tree clean |
| 0.2 | Run `npm run build` once, fix what it surfaces | Dev mode hides prod-only errors | **Done** — build, typecheck and lint all pass; nothing surfaced to fix |
| 0.3 | In-app notifications (bell / unread count on new swap requests and messages) | Every growth idea below is dead on arrival if members only find out about activity by refreshing the dashboard | **Done** — header bell + `/notifications`, no schema change needed |

---

## Phase 1 — Cheapest wins (data/schema already supports these) ✅ done

| # | Item | What it unlocks | Effort | Simpler alternative | Status |
|---|------|------------------|--------|----------------------|--------|
| 1.1 | **Skill category filter on Browse** | `Skill.category` already exists in the schema and is populated by seed data — this is a missing filter dropdown, not new data modeling | small | — already the simple version | **Done** — category `<Select>` added to `src/app/browse/page.tsx`, verified live (`?category=Music` narrowed 9 → 4 members) |
| 1.2 | **Pagination on Browse** | Removes the hard 60-row cap silently breaking as members grow | small | Instead of full cursor pagination, ship a "Load more" button first (offset-based); switch to cursor pagination only if performance complains | **Done** — offset-style `take`/"Load more" link, default page size 24 (up from a flat 60-row cap with no way to see more). Cursor pagination deliberately **not** done; see the note below |
| 1.3 | **Skill-level display on profiles** (`UserSkill.level` is already stored) | Turns the profile into a visible personal-growth tracker for free — no new writes needed, only a read-side render | trivial | — already the simple version | **Already done** before this roadmap existed — it shipped in the original `feat: skill-swap marketplace` commit. No work needed. |
| 1.4 | **Post-swap reflection prompt** | "What did you learn?" — reuse the existing `Review.comment` field/UI instead of a new model; just add a prompt/placeholder text | trivial | Use the existing review comment box instead of a new "learning journal" table | **Done** — `ReviewForm` now labels the comment field "What did you learn about {skill}?" using the swap's actual learned skill, no schema change |

> **Deferred from 1.2 — cursor pagination.** The shipped "Load more" is offset-based over a
> newest-first list, so a registration landing mid-browse shifts rows down and the boundary member
> can be returned twice. Cosmetic, and unreachable at current scale. Revisit when sign-ups are
> frequent enough for two page loads to straddle one — the original "switch only if performance
> complains" trigger should read *correctness*, not performance.

---

## Phase 2 — Community growth

**Status: 2.1, 2.2 and 2.4 done (2026-09-01). 2.3 and 2.5 deliberately not started.**

| # | Item | Simpler alternative | Status |
|---|------|----------------------|--------|
| 2.1 | Email notification on new swap request / message | Start with one transactional email ("new swap request received") before building digests or a preferences UI | **Done** — pluggable transport, console by default, Resend over `fetch` when configured. One email only; no digests, no preferences UI |
| 2.2 | "Wanted" board — post a want with no match yet, get notified later | Reuse existing `UserSkill` WANT rows — make WANTs publicly browsable/searchable (Browse filtered to `kind = WANT`) instead of a new board/model | **Done** — Browse gained an "Offering a skill / Looking to learn" switch. No new model. The notify-later half is not built |
| 2.3 | Groups/circles by skill or city | Full version needs a new `Group` model + membership. Simpler alternative: a saved search ("follow all Bangalore Potters") that re-runs the existing Browse query and notifies on new matches — no new schema | **Not started** — needs saved searches, which need the notify-later half of 2.2 first |
| 2.4 | Referral/invite nudge after a completed swap | A static "Invite someone who teaches X" share message on the swap-completion screen — no referral-tracking table needed for v1 | **Done** — shows on a completed swap only when the member wants a skill nobody teaches, and names that skill. No tracking table |
| 2.5 | Community events / group workshops | Largest lift (new one-to-many booking model). Defer until 2.1–2.4 prove engagement; simpler alternative is an external link (Meet/Calendar) posted on a profile rather than in-app scheduling | **Not started** — deferred by design until engagement justifies it |

---

## Phase 3 — Personal growth

| # | Item | Simpler alternative |
|---|------|----------------------|
| 3.1 | Badges for completed swaps ("5 swaps completed", "Taught 3 people Python") | Compute on the fly from existing `SwapRequest`/`Review` counts at render time — no new `Badge` table needed for v1 |
| 3.2 | Session scheduling with calendar | Let either party paste a scheduling link (Calendly-style) into chat — zero schema change |
| 3.3 | Recommendation engine ("people who want X also want Y") | A single SQL query over existing tables (mutual want/offer match) instead of a collaborative-filtering model |

---

## Phase 4 — Monetization (kept outside the peer swap loop by design)

| # | Item | Simpler alternative |
|---|------|----------------------|
| 4.1 | Premium tier (profile boost in Browse ranking, unlimited active swaps if a free cap is added) | Ship as a single `User.isPremium` boolean + one Stripe payment link before building a full billing/plans UI |
| 4.2 | Verified badge (identity/credential check) | Manual admin verification (a checkbox you flip) before paying for a third-party ID-verification API |
| 4.3 | Sponsored/featured skill listings for local businesses | A single "featured" flag, sold manually at first — no self-serve ad platform until there's demand |
| 4.4 | B2B/community licensing (coworking spaces, alumni networks) | Not a build item yet — a sales motion on the existing app (org-scoped tag/subdomain), revisit only after Phase 1–3 prove retention |
| 4.5 | Paid group workshops / event ticketing | Depends on 2.5. Until then, take payment off-platform (a Stripe/Razorpay payment link shared in chat) rather than building payments + ticketing |

---

## Suggested order

1. ~~Phase 0 — all three~~ **complete.**
2. Phase 1 — all four; cheap, and 1.1/1.3 use data already sitting in the DB.
3. 2.1 → 2.2 → 2.4 — notification-dependent, low schema cost.
4. 3.1 → 3.2 → 3.3 — no schema cost, pure read-side/UI.
5. 4.1 → 4.2 → 4.3 — monetization, once there's enough traffic to matter.
6. Revisit 2.3, 2.5, 4.4, 4.5 only once the above show real engagement — they're the only items
   needing new schema/models, so they're the most expensive to get wrong early.
