# Job Aggregator — Dedup & Alerts

A full-stack web app that pulls job listings from multiple public job APIs, **deduplicates the same posting when it shows up across sources**, lets users save search filters as standing alerts, and emails them the moment a new listing matches — without ever sending the same alert twice.

Built as a solo, portfolio-scale project (dozens to low hundreds of users), but designed with the same rigor you'd apply at real scale. Every architecture decision below has a written rationale — see [`/docs/adr`](./docs/adr) for the full records, or the condensed version in this README.

> **Status:** 🚧 In active development. This README describes the target architecture and is being built out step by step — see [Build status](#build-status) for what's actually working right now.

---

## Why this isn't "just another CRUD app"

Three things make this harder than a typical tutorial job board, and the architecture is built specifically to handle them:

1. **Deduplication across sources.** The same job gets posted to multiple APIs with slightly different wording. A naive aggregator just shows the same job 3 times — this one normalizes, fingerprints, and collapses duplicates at the database layer, not just in application code.
2. **Background work that can't block users.** Fetching from external APIs is slow and occasionally flaky. That work runs in a completely separate worker process on its own queue — a slow or down source never makes a user's search feel slow.
3. **Alerts that are guaranteed correct, not just "probably fine."** "A user never gets two emails for the same job" is a hard requirement, enforced with a real database constraint (`UNIQUE(saved_search_id, job_id)`) — not something the application just tries to remember to check.

---

## Tech stack

| Layer | Choice | Why (short version) |
|---|---|---|
| Frontend + API | **Next.js** (Vercel) | SSR gives SEO on individual job pages — plain client-side React can't do that |
| Database | **PostgreSQL** | The app's two most common operations (dedup inserts, alert matching) are relational and transactional by nature — real joins and a real `UNIQUE` constraint beat recreating that logic in a document store |
| Queue / cache | **Redis + BullMQ** (Upstash) | Decouples slow external API calls from user-facing requests; one bad source can't stall the other three |
| Worker | **Node.js, persistent process** (Render/Railway) | BullMQ needs a long-running process to hold queue connections — this can't be a serverless function, which only lives for the length of one request |
| Auth | **Custom JWT + bcrypt** | Deliberate choice to demonstrate the mechanism rather than configure a SaaS — see the [honest trade-off](#a-note-on-the-custom-auth-decision) below |
| Email | **Resend** | Async, queued, retried independently from ingestion |

Full reasoning for every row above — including what each alternative would have cost — is in [`/docs/adr`](./docs/adr).

---

## Architecture

```
 Client (Next.js, Vercel)
        │ HTTPS
        ▼
 API server (Next.js API routes — auth / search / CRUD)
        │
        ├──────────────► Postgres (users, jobs, saved_searches)
        │                     ▲
        │                     │ dedup insert + match check
        │
        └──────────────► Redis (cache + BullMQ queue)
                              │ jobs pulled from queue
                              ▼
                      Worker (persistent Node process — Render/Railway)
                      ingestion + matching + alerts
                         │                    │
                         ▼                    ▼
              External job APIs      Email provider (Resend)
              (Adzuna, Jooble, etc.)
```

**Why the worker is a separate deployment, not just a background function:** serverless functions are short-lived by design — they can't hold the persistent queue connection BullMQ needs, and can't run on a schedule independent of a user's request. So the frontend and API live on Vercel (serverless-friendly), and the worker deploys separately as a long-running process. This is a deliberate split, not an oversight — full reasoning in [ADR-006](./docs/adr/006-deployment-topology.md).

### Data flow

1. **Search:** Client → `GET /api/jobs?...` → Redis cache check on the normalized query key → miss → Postgres full-text search → cache result (5 min TTL) → return.
2. **Ingestion:** a repeatable BullMQ job (per source, hourly, staggered) → worker calls the external API → normalizes each listing → computes a fingerprint (normalized company + title + location) → inserts with `ON CONFLICT (fingerprint) DO NOTHING` → on successful insert, enqueues a matching job.
3. **Matching + alerts:** matching job queries `saved_searches` whose filters match the new job → inserts a `job_matches` row per match → enqueues an alert-email job for each unsent match → email worker sends and stamps `alert_sent_at`.

---

## Getting started

### Prerequisites

- Node.js LTS (v22.x) — [nodejs.org](https://nodejs.org)
- A Postgres instance (local, or a free tier from Render/Railway/Supabase)
- A Redis instance (local, or Upstash free tier)
- API keys for at least one job source (e.g. Adzuna) and Resend (for email)

### Setup

```bash
# Clone and install
git clone https://github.com/<your-username>/job-aggregator.git
cd job-aggregator
npm install

# Copy env template and fill in your own values
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start the Next.js app (frontend + API)
npm run dev

# In a separate terminal, start the background worker
npm run worker:dev
```

The app runs at `http://localhost:3000`. The worker has no UI — watch its terminal output to confirm it's picking up ingestion jobs.

### Environment variables

See [`.env.example`](./.env.example) for the full list. At minimum you'll need a `DATABASE_URL`, `REDIS_URL`, a `JWT_SECRET`, at least one job-source API key, and a `RESEND_API_KEY`.

---

## Project structure

```
job-aggregator/
├── app/                  # Next.js app router — pages + API routes
│   └── api/
│       ├── auth/         # register, login
│       ├── jobs/         # search, job detail
│       └── saved-searches/
├── worker/               # Persistent Node process — ingestion, matching, alerts
│   ├── queues/           # BullMQ queue + job definitions
│   └── sources/          # Per-external-API adapters
├── lib/                  # Shared code (db client, auth helpers, normalization)
├── db/
│   └── migrations/       # Postgres schema migrations
├── docs/
│   └── adr/              # Architecture decision records (6 ADRs)
└── .env.example
```

---

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/jobs` | Optional | Search/filter jobs |
| GET | `/api/jobs/:id` | No | Job detail |
| POST | `/api/saved-searches` | Yes | Create an alert |
| GET | `/api/saved-searches` | Yes | List user's alerts |
| DELETE | `/api/saved-searches/:id` | Yes | Remove an alert |

Example: `GET /api/jobs?q=react+developer&location=bangalore&remote=true&page=1`

```json
{
  "results": [
    {
      "id": "b2f1...",
      "title": "Frontend Developer (React)",
      "company": "Acme Co",
      "location": "Bangalore, India",
      "remote": true,
      "salary_min": 600000,
      "salary_max": 900000,
      "currency": "INR",
      "source_url": "https://...",
      "posted_at": "2026-07-28T10:00:00Z"
    }
  ],
  "page": 1,
  "total": 128
}
```

---

## Key design decisions (condensed)

Full records with options considered, trade-off analysis, and consequences are in [`/docs/adr`](./docs/adr). Short version:

| Decision | Chosen | Alternative considered | Why |
|---|---|---|---|
| Deduplication | Rules-based fuzzy matching + DB constraint | ML/embeddings similarity | Cheap, fast, explainable at this data volume. Revisit if false-positive/negative rate becomes a real problem. |
| Background processing | Worker + Redis/BullMQ queue | Inline ingestion in the API server | Decouples slow/flaky external calls from user-facing latency; scales horizontally almost for free |
| Primary datastore | Postgres | MongoDB | The app's core operations (dedup, alert matching) are relational by nature — joins and a real `UNIQUE` constraint beat recreating that logic in a document store |
| Search | Postgres full-text search | Elasticsearch | One less service to run, monitor, and pay for. Revisit if relevance needs (ranking, typo tolerance) or QPS outgrow Postgres FTS. |
| Deployment topology | Two platforms (Vercel + Render/Railway) | Everything on one platform | Costs more operational overhead in exchange for each component running on infrastructure suited to what it does |

### A note on the custom auth decision

Auth is a **custom JWT + bcrypt implementation**, not a managed provider like Clerk or Auth0 — and that choice is deliberately **context-dependent, not universal**. For a real product handling real user data, "don't roll your own auth" is good default advice, and a managed provider would be the obviously correct call. For this project, built specifically to demonstrate fundamentals, building it is the point: it trades real (mitigated) security risk — this app holds no payment data and limited PII — for a stronger demonstration of understanding hashing, tokens, and session handling. Full reasoning, including what a managed provider gives up front (MFA, breach detection) in [ADR-005](./docs/adr/005-authentication-approach.md).

---

## Known limitations (documented, not accidental)

Being upfront about what this doesn't do, and why that's an acceptable trade-off at this scale:

- **Single region, single instance** of Postgres and Redis — a real single point of failure, acceptable for a portfolio project, not for anything serving real users at scale.
- **Some true duplicates slip through** when listing wording diverges significantly between sources — a known, accepted gap in the fuzzy-matching approach, with a concrete trigger for revisiting it (frequent "I'm seeing the same job twice" reports).
- **No MFA, breach detection, or managed password-reset flows** — a trade-off of the custom auth decision above.
- **Basic search relevance** — keyword-plus-filters works well; "did you mean" or heavily ranked results would need a dedicated search service.

What I'd revisit as this grows is listed in full at the end of the [system design doc](./docs/system-design.md).

---

## Build status

- [ ] Project scaffolding
- [ ] Database schema + migrations
- [ ] Auth (register/login)
- [ ] Job search + filtering API
- [ ] Ingestion worker (first source)
- [ ] Deduplication logic
- [ ] Saved searches + matching
- [ ] Email alerts
- [ ] Deployment

*(Updated as each piece is built — not all boxes are checked yet.)*

---
