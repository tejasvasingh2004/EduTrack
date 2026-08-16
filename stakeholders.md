# Stakeholders — EduTrack

Last updated: 2026-08-16

## Team

| Name | Role in this build |
|---|---|
| **Nachiket** | Track A — Core platform (Auth, Applications, Dashboard) |
| **Tejasva** | Track B — Career module + WhatsApp/LinkedIn reconciliation |

## Why this split

Both tracks were chosen so each person owns a **disjoint set of files** after
Phase 0 (see `hld.md` §5 for the folder map). The only genuinely shared file is
`prisma/schema.prisma` — that's why it's built once, together, in Phase 0, and
frozen (see rules below) so nobody edits it solo mid-build.

## Phases

### Phase 0 — Shared foundation (both, pair-built, ~day 1)
Done together in one sitting to avoid any later schema disagreement:
- `prisma/schema.prisma` — full schema (all models from `hld.md` §4)
- `lib/auth/*` — JWT + cookie helpers, `requireAuth` / `requireRole` middleware
- `lib/validation/*` — shared Zod base patterns
- Project scaffold, env vars, DB migration

**Rule: once Phase 0 is merged, `schema.prisma` is frozen.** If either track
needs a schema change afterward, open a PR, tag the other person, get a
thumbs-up before merging — never push directly to it.

### Phase 1 — Parallel build

**Nachiket — Track A**
| Module | Files |
|---|---|
| Auth routes | `app/api/auth/*` |
| Application pipeline | `app/api/applications/*` |
| Admin dashboard | `app/api/dashboard/*` |
| Admin/Mentor/Student portal shells (frontend) | `app/(admin)/*`, `app/(mentor)/*`, `app/(student)/*` base layouts |

**Tejasva — Track B**
| Module | Files |
|---|---|
| Career tracking | `app/api/career/*` |
| Chatbot mock | `app/api/chatbot/*` |
| WhatsApp/LinkedIn reconciliation | `app/api/reconciliation/*`, `lib/scraper/*`, `lib/whatsapp/*`, `lib/llm/*` |

Neither track touches the other's folder. Both branch off `main` after Phase 0
merges, and both can merge back independently without conflicts as long as
neither edits `schema.prisma` again in this phase.

### Phase 2 — Integration (both, ~last day)
- Wire dashboard (Track A) to show reconciliation status per student (Track B's
  `RECONCILIATION_ATTEMPT` data) — small, reviewed PR touching both areas.
- End-to-end test: application → approval → mentor assignment → skill log →
  employment record → simulated 6-month reconciliation cycle.
- Update `progress.md` and `bugs.md` together.

## Git workflow (to keep this conflict-free in practice)

- Branch naming: `track-a/<feature>` and `track-b/<feature>`.
- Small, frequent PRs against `main`, not one giant branch per person.
- Anyone touching a shared file (`schema.prisma`, `lib/auth`, `lib/validation`)
  outside Phase 0 must open a PR and get the other person's review first.
- `progress.md` is updated by whoever finishes a task, same day.

## Consent & compliance owner

Both are jointly responsible for making sure the consent checkbox (PRD §6) ships
before any real beneficiary is scraped or messaged — this is a hard gate, not a
nice-to-have, given it involves personal data and unsolicited WhatsApp contact.