# HLD — EduTrack High-Level Design

Status: Draft v1 · Companion to `prd.md` · Last updated: 2026-08-16

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) — frontend + API routes in one codebase |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT in HTTP-only cookie, custom middleware (no third-party auth provider) |
| Validation | Zod on every API route |
| Messaging | Twilio WhatsApp Business API |
| LinkedIn data | Proxycurl / Bright Data (third-party scraping service) |
| Reply parsing | LLM (Claude API) — free text → structured JSON |
| Styling | Tailwind (per `postcss.config.mjs`) |

## 2. System Architecture

```mermaid
flowchart TB
    subgraph Client
        A[Admin Portal]
        M[Mentor Portal]
        S[Student Portal]
        Pub[Public Application Form]
    end

    subgraph NextApp["Next.js App (App Router)"]
        API[API Routes /app/api/*]
        MW["Auth + RBAC + Zod Middleware"]
    end

    subgraph Services["External Services"]
        Twilio["Twilio WhatsApp API"]
        Proxy["Proxycurl / LinkedIn Scraper"]
        LLM["Claude API - reply parsing + chatbot"]
    end

    DB[(PostgreSQL via Prisma)]
    Cron["Scheduled Job - 6mo cycle"]

    A --> API
    M --> API
    S --> API
    Pub --> API
    API --> MW --> DB

    Cron --> Proxy
    Cron --> DB
    Cron --> Twilio
    Twilio -- "beneficiary reply webhook" --> API
    API --> LLM
    LLM --> DB
```

## 3. Post-Placement Reconciliation — Sequence Diagram

```mermaid
sequenceDiagram
    participant Cron as Scheduler (every 6mo)
    participant DB as PostgreSQL
    participant Scraper as Proxycurl
    participant Twilio as Twilio WhatsApp
    participant Ben as Beneficiary
    participant LLM as Claude API

    Cron->>DB: Find students placed >=6mo ago, due for refresh
    loop each due student
        Cron->>Scraper: Fetch profile by stored LinkedIn URL
        Scraper-->>Cron: title, company, location
        Cron->>DB: Diff vs current EmploymentRecord
        alt no change
            Cron->>DB: Log "no change" attempt, skip message
        else changed
            Cron->>Twilio: Send template message with new info
            Twilio->>Ben: WhatsApp message
            Ben-->>Twilio: Free text reply
            Twilio->>API/Webhook: Inbound message webhook
            API/Webhook->>LLM: Parse reply into structured fields
            LLM-->>API/Webhook: {jobTitle, company, salaryBand?}
            API/Webhook->>DB: Create new EmploymentRecord (isCurrent=true), close old one
        end
    end
    Note over Cron,DB: No reply within window -> log failed attempt, retry next cycle, no data changed
```

## 4. Data Model (ER overview)

```mermaid
erDiagram
    USER ||--o| APPLICATION : "converted_from"
    USER ||--o{ SKILL_PROGRESS : has
    USER ||--o{ EMPLOYMENT_RECORD : has
    USER ||--o| MENTOR_STUDENT : "is_student_in"
    USER ||--o{ MENTOR_STUDENT : "is_mentor_in"
    USER ||--o{ CHATBOT_QUERY : asks
    USER ||--o{ RECONCILIATION_ATTEMPT : "tracked_by"

    USER {
        string id PK
        string email
        string role
        string linkedinUrl
        boolean consentGiven
        datetime consentAt
    }
    APPLICATION {
        string id PK
        string status
        string userId FK
    }
    MENTOR_STUDENT {
        string mentorId FK
        string studentId FK
    }
    SKILL_PROGRESS {
        string studentId FK
        string skillName
        int level
    }
    EMPLOYMENT_RECORD {
        string studentId FK
        string jobTitle
        string company
        string salaryBand
        boolean isCurrent
    }
    RECONCILIATION_ATTEMPT {
        string studentId FK
        string status
        datetime scheduledFor
        datetime respondedAt
    }
    CHATBOT_QUERY {
        string studentId FK
        string prompt
        string response
    }
```

`RECONCILIATION_ATTEMPT` is a new table (not in the original schema) that tracks
each 6-month cycle per student: `PENDING_SCRAPE → NO_CHANGE_SKIPPED |
AWAITING_REPLY → CONFIRMED | NO_RESPONSE`. This keeps a clean audit trail
separate from the actual `EmploymentRecord`, so a bad scrape or unanswered
message never silently corrupts confirmed data.

## 5. Module → Folder Mapping (avoids merge conflicts, see `stakeholders.md`)

```
app/
  api/
    auth/            -> auth module
    applications/    -> application pipeline module
    career/          -> career tracking module
    dashboard/        -> dashboard module
    chatbot/         -> chatbot module
    reconciliation/  -> WhatsApp+LinkedIn module (webhook + cron trigger)
lib/
  auth/              -> jwt, cookies, RBAC middleware (shared, frozen after Phase 0)
  validation/        -> zod schemas (shared, frozen after Phase 0)
  scraper/           -> proxycurl client
  whatsapp/          -> twilio client + template senders
  llm/               -> reply-parsing prompt + client
prisma/
  schema.prisma      -> shared, single-owner edits only (see stakeholders.md)
```

## 6. Reconciliation State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING_SCRAPE
    PENDING_SCRAPE --> NO_CHANGE_SKIPPED: scraped data matches DB
    PENDING_SCRAPE --> AWAITING_REPLY: scraped data differs, message sent
    AWAITING_REPLY --> CONFIRMED: reply parsed and saved
    AWAITING_REPLY --> NO_RESPONSE: no reply before next cycle
    NO_CHANGE_SKIPPED --> [*]
    CONFIRMED --> [*]
    NO_RESPONSE --> [*]
```

## 7. Open Items Before Build (see `prd.md` §8)

- Twilio template approval status/timeline.
- Whether LLM-parsed updates need an admin approval step before committing
  (current default: auto-commit; state machine above supports adding a
  `PENDING_ADMIN_REVIEW` state later without breaking anything).