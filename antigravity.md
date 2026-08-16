# antigravity.md — Project Context for the Antigravity Agent

This file is the entry point the agent should read first, every session, before
touching code. It doesn't duplicate the detail in the other docs — it points to
them and states the ground rules for how the agent should behave in *this*
repo specifically.

## What this project is

EduTrack — a Next.js + PostgreSQL/Prisma platform that runs an NGO
beneficiary's lifecycle end to end: application → approval → mentorship →
skill tracking → placement → automated post-placement career tracking via
LinkedIn scraping + WhatsApp confirmation. Full detail: `prd.md` (what to
build) and `hld.md` (how it's structured, with diagrams).

## Source of truth, in order

1. `prd.md` — product requirements. If a request conflicts with this, flag it,
   don't silently override it.
2. `hld.md` — architecture, module boundaries, data model, the reconciliation
   state machine. Treat the module → folder mapping in §5 as binding.
3. `stakeholders.md` — who owns which folder and which phase we're in. Before
   generating or editing code, check whether the file being touched belongs to
   Track A (Nachiket), Track B (Tejasva), or shared Phase-0 territory.
4. `rules.md` — coding/contribution standards for this repo.
5. `progress.md` — what's already done; don't redo or overwrite finished work
   without being asked.

## Hard constraints for the agent

- **Never edit `prisma/schema.prisma` outside a Phase-0 task or an explicit
  request to change it.** It's the one shared file across both stakeholders —
  see `stakeholders.md` for the review requirement.
- **Stay inside the module boundary you're asked to work on.** If a task for
  Track B's reconciliation module seems to need a change in Track A's
  dashboard code, stop and say so instead of editing both.
- **Never write real API keys, LinkedIn scraper credentials, or Twilio
  credentials into code.** Env vars only, and confirm `.env.example` documents
  the new variable name.
- **Don't fabricate scraped or beneficiary data** for anything beyond seed/test
  fixtures explicitly marked as such.
- Match the reconciliation state machine in `hld.md` §6 exactly — the states
  (`PENDING_SCRAPE`, `NO_CHANGE_SKIPPED`, `AWAITING_REPLY`, `CONFIRMED`,
  `NO_RESPONSE`) are the contract other parts of the system depend on.

## Skills (`.agents/skills/`)

These should be treated as EduTrack-specific checklists, not generic
boilerplate. Each one is being rewritten to reference this project directly —
see the accompanying prompt used to regenerate them. In short:

- `write_specs.md` — template for turning a `prd.md` requirement into an
  implementable spec before code is written.
- `generate_code.md` — code-generation rules scoped by module/track ownership,
  so generated code never crosses into another track's folder.
- `audit_code.md` — review checklist covering this project's specific risk
  areas: RBAC on every route, Zod validation on every input, consent checks
  before any scrape/message, N+1 query prevention on list endpoints.
- `deploy_app.md` — deployment steps for this exact stack (Next.js + Prisma +
  Postgres + Twilio + Apify env vars).

## Workflows (`.agents/workflows/`)

- `startcycle.md` — how a work session should start: read this file, then
  `progress.md`, then confirm which track/phase is active before writing code.
- `agents.md` — defines what sub-agent roles (if any) the coding agent should
  simulate for this project (e.g. a "schema reviewer" persona that must sign
  off before `schema.prisma` changes merge).

## Root docs this file assumes exist and stay current

`CLAUDE.md`, `README.md`, `rules.md`, `bugs.md`, `progress.md` — all should be
kept aligned with the phase plan in `stakeholders.md`, not generic templates.