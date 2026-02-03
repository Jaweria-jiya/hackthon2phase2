# Claude.md — Spec‑Driven Multi‑Agent Setup

## Project: Todo Full‑Stack Web Application (Phase II)

This document defines how Claude Code + Spec‑Kit Plus should operate using **multiple agents** to build a full‑stack, authenticated Todo web application from a console app.

---

## 🎯 Objective

Transform the existing console‑based Todo application into a **modern multi‑user web application** with:

* Authentication (Better Auth)
* RESTful API (FastAPI)
* Persistent storage (Neon PostgreSQL)
* Responsive UI (Next.js App Router)
* Secure JWT‑based communication

All development follows **Spec‑Driven Development using Claude Code + Spec‑Kit Plus**.

---

## 🧱 Technology Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Frontend       | Next.js 16+ (App Router)    |
| Backend        | Python FastAPI              |
| ORM            | SQLModel                    |
| Database       | Neon Serverless PostgreSQL  |
| Authentication | Better Auth                 |
| Method         | Claude Code + Spec‑Kit Plus |

---

## 🤖 Agent Architecture

Claude must work using **four dedicated agents**.

---

### 🔐 Auth‑Agent — Authentication Layer

Responsible for **all authentication and authorization flows**.

#### Responsibilities

* Configure Better Auth in Next.js
* Enable JWT plugin for token issuance
* Implement signup and login flows
* Hash passwords securely (bcrypt / argon2)
* Issue JWT tokens on login
* Configure token expiration and refresh
* Store tokens in secure httpOnly cookies
* Attach JWT to frontend API requests
* Provide shared JWT secret configuration
* Handle auth errors cleanly

#### Required Environment

```env
BETTER_AUTH_SECRET=super-long-secure-secret
```

---

### 🎨 Frontend‑Agent — Next.js UI Layer

Responsible for **all frontend development** using Next.js App Router.

#### Responsibilities

* Build responsive UI (mobile‑first)
* Create pages:
  * `/` landing
  * `/signup`
  * `/login`
  * `/dashboard` (protected)
* Implement form validation
* Build todo components
* Integrate API client
* Attach JWT token to headers
* Handle loading and error states
* Implement protected routing
* Add accessibility support

#### API Client Example

```ts
headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
}
```

---

### 🗄️ Database‑Agent — Neon + SQLModel

Responsible for **database design and operations**.

#### Responsibilities

* Design schema for users and tasks
* Configure Neon PostgreSQL
* Implement SQLModel models
* Create migrations
* Add indexes
* Enforce foreign keys
* Handle constraints
* Provide optimized queries

#### Core Tables

```sql
users(id, email, password_hash, created_at)
tasks(id, user_id, title, description, completed, created_at, updated_at)
```

---

### ⚙️ Backend‑Agent — FastAPI Layer

Responsible for **all REST API and business logic**.

#### Responsibilities

* Build RESTful endpoints
* Implement JWT verification middleware
* Extract user info from token
* Validate user_id in URL
* Filter queries by authenticated user
* Implement CRUD logic
* Configure CORS
* Handle errors
* Document API with OpenAPI

---

## 🔐 Authentication Architecture

Better Auth runs on **Next.js**, while FastAPI runs separately. They communicate using **JWT tokens**.

### Flow

1. User logs in on frontend
2. Better Auth validates credentials
3. Better Auth issues JWT
4. Frontend stores token securely
5. Frontend sends requests with Authorization header
6. Backend verifies JWT using shared secret
7. Backend extracts user_id
8. Backend ensures URL user_id matches token user_id
9. Backend returns filtered data

---

## 🔑 Shared Secret Configuration

Both services must use the same secret.

### Frontend

```env
BETTER_AUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend

```env
BETTER_AUTH_SECRET=your-secret
DATABASE_URL=postgresql://user:pass@neon/db
CORS_ORIGINS=http://localhost:3000
```

---

## 🌐 API Endpoints

| Method | Endpoint                           | Description       |
| ------ | ---------------------------------- | ----------------- |
| GET    | /api/{user_id}/tasks               | List tasks        |
| POST   | /api/{user_id}/tasks               | Create task       |
| GET    | /api/{user_id}/tasks/{id}          | Get task          |
| PUT    | /api/{user_id}/tasks/{id}          | Update task       |
| DELETE | /api/{user_id}/tasks/{id}          | Delete task       |
| PATCH  | /api/{user_id}/tasks/{id}/complete | Toggle completion |

All endpoints require JWT except signup/login.

---

## 🔒 Security Rules

* JWT required on all /api routes
* user_id in URL must match token
* Filter all queries by token user_id
* Return 401 on invalid token
* Return 403 on mismatch
* Never expose secrets

---

## 🧪 Development Phases

1. Database‑Agent → Schema + Neon
2. Backend‑Agent → API + JWT
3. Auth‑Agent → Better Auth
4. Frontend‑Agent → UI + Client
5. Integration testing

---

## ✅ Success Criteria

* Users can signup/login
* JWT works end‑to‑end
* CRUD works
* Data is isolated per user
* UI responsive
* No security leaks

---

## 📌 Claude Instructions

Claude must:

* Use Auth‑Agent for authentication
* Use Frontend‑Agent for UI
* Use Database‑Agent for schema
* Use Backend‑Agent for FastAPI
* Follow Spec‑Driven Development
* Produce production‑ready code
* Avoid placeholders
* Maintain security best practices

---

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

---

## Development Guidelines

### 1. Authoritative Source Mandate
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1. **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2. **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3. **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4. **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps.

---

## Default Policies (Must Follow)

- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

---

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

---

## Code Standards

See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.
