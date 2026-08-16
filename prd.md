# PRD — EduTrack: Unified NGO Beneficiary & Career Platform

Status: Draft v1 · Owner: Product · Last updated: 2026-08-16

## 1. Problem

NGOs like Katalyst run large-scale student application intake, but application data
is scattered, communication is manual, and there is no reliable way to track what
happens to a beneficiary *after* they're placed in a job — which is the metric NGOs
are actually funded and evaluated on.

## 2. Goals

1. One system to run the full beneficiary lifecycle: application → approval →
   mentorship → skill growth → placement → post-placement tracking.
2. Make post-placement tracking near-zero-effort for the NGO by automating data
   refresh via LinkedIn + WhatsApp instead of manual follow-up calls/forms.
3. Give Admins a single dashboard to see pipeline health and outcomes without
   manual spreadsheet consolidation.

## 3. Non-goals (out of scope for this build)

- Payroll/stipend disbursement, LMS/course content hosting, general CRM features.
- Real LLM-powered chatbot logic (MVP ships a mock endpoint only).
- Any scraping of platforms other than LinkedIn.

## 4. Users / Roles

| Role | Who | Key needs |
|---|---|---|
| **Admin** (NGO staff) | Katalyst ops team | Review applications, assign mentors, view dashboard, oversee placement data quality |
| **Mentor** | Volunteer/staff mentor | View assigned students, log skill progress |
| **Student / Beneficiary** | Applicant → placed alumnus | Apply, track own status, ask chatbot questions, confirm/correct career info over WhatsApp |

## 5. Functional Requirements

### 5.1 Auth & Portals
- Email/password login, JWT in an HTTP-only cookie, 3 roles with route-level RBAC.
- Each role lands on a distinct portal view.

### 5.2 Application Pipeline
- Public application/event sign-up form (no login required).
- Admin can filter/search/paginate applications and set status:
  `PENDING → APPROVED | REJECTED | WAITLISTED`.
- Approved applications convert into a `STUDENT` user account.

### 5.3 Career & Beneficiary Tracking
- Admin assigns a Mentor to a Student (1 mentor : many students, 1 student : 1 mentor for MVP).
- Mentor/Admin log `SkillProgress` entries over time.
- Admin logs `EmploymentRecord` entries (job title, company, salary band, dates).
- Student profile view shows mentor + skill history + employment history in one place.

### 5.4 Post-Placement Auto-Tracking (new — core differentiator)
- 6 months after a student's placement date, and every 6 months thereafter, the
  system:
  1. Looks up the student's stored LinkedIn URL (captured at application/onboarding).
  2. Calls a third-party scraping service (Proxycurl/Bright Data) to fetch current
     job title, company, location.
  3. Diffs scraped data against what's on file.
  4. **If nothing changed → no message is sent** (silent skip, logged).
  5. **If something changed** → sends a WhatsApp template message via Twilio
     showing the new info and asking the beneficiary to confirm or correct it in
     free text.
  6. Beneficiary's free-text reply is parsed by an LLM into structured fields
     (job title, company, salary band if mentioned, etc.).
  7. Parsed result is written to `EmploymentRecord` as a new record (old one
     marked non-current).
  8. If the beneficiary never replies → no data is changed, the attempt is logged
     as failed/no-response, and it will be retried at the next 6-month cycle.

### 5.5 Admin Dashboard
- Paginated, filterable, N+1-safe view of all beneficiaries with mentor,
  current employment snapshot, and skill count.

### 5.6 Chatbot (MVP)
- `POST /api/chatbot/query` — students submit a prompt, get a mock response,
  logged to DB. Real LLM logic is a follow-up phase, contract stays stable.

## 6. Data Privacy / Consent

- Beneficiary must explicitly consent (checkbox at application time) to (a) their
  LinkedIn profile being looked up periodically and (b) being contacted on
  WhatsApp for career-update confirmation. Consent timestamp is stored.
- Only employment-facing fields are stored from LinkedIn (job title, company,
  location, start date) — no scraping of connections, posts, or endorsements.

## 7. Success Metrics

- % of placed beneficiaries with career data refreshed within the last 6 months.
- % of WhatsApp confirmation messages that get a reply.
- Admin time spent per week on manual data reconciliation (target: near zero).

## 8. Assumptions (flagged for confirmation)

- Twilio WhatsApp Business number + Meta-approved message templates are set up
  separately from this build (template approval can take several days — start early).
- English-only messaging for MVP.
- LLM parsing writes directly to `EmploymentRecord` without a manual admin
  approval step (see HLD §6 for the reconciliation state machine — this can be
  changed to require admin sign-off later without a schema change).