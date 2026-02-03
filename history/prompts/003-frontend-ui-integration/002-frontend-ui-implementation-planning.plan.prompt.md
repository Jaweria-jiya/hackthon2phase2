---
id: 002
title: Frontend UI Implementation Planning
stage: plan
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-frontend-ui-integration
branch: 003-frontend-ui-integration
user: ALI
command: /sp.plan
labels: ["plan", "frontend", "nextjs", "architecture", "api-client", "optimistic-ui", "tailwind", "accessibility", "adr"]
links:
  spec: specs/003-frontend-ui-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-frontend-ui-integration/plan.md
  - specs/003-frontend-ui-integration/research.md
  - specs/003-frontend-ui-integration/data-model.md
  - specs/003-frontend-ui-integration/contracts/api-endpoints.md
  - specs/003-frontend-ui-integration/quickstart.md
  - CLAUDE.md (agent context updated)
tests:
  - No tests (planning documentation)
---

## Prompt

/sp.plan
Project: Todo Full-Stack Web Application — Spec 3: Frontend UI & API Integration Layer

## Phase 0: Design System Setup (1 hour)
**Goal:** Configure Tailwind with custom color palette and typography

Tasks:
1. Install dependencies: npm install tailwindcss@latest lucide-react clsx tailwind-merge
2. Update tailwind.config.js with custom colors (#a47ec2, #F6E3BA, #000000)
3. Create design tokens file: lib/design-tokens.ts
4. Create utility functions: lib/utils.ts (cn function for class merging)

Validation:
- Tailwind generates correct CSS with custom colors
- Colors are accessible (contrast ratio ≥ 4.5:1)
- Font loads correctly

[Additional phases provided by user: Authentication Pages, API Client Setup, Dashboard Layout, Task List Page, Create/Edit Task Form, Navigation & Routing, Polish & Accessibility, Integration Testing]

## Response snapshot

Successfully created comprehensive implementation plan for Frontend UI & API Integration Layer with complete Phase 0 (Research) and Phase 1 (Design & Contracts) documentation.

**Planning Artifacts Created**:

1. **plan.md** - Complete implementation plan with:
   - Technical context (TypeScript 5.0+, Next.js 16+, Tailwind CSS 3+, Better Auth)
   - Constitution compliance verification (all 6 frontend principles satisfied)
   - Project structure (Next.js App Router with route groups)
   - 6 implementation phases (Foundation, Auth UI, API Client, Dashboard, Task Management, Polish)
   - 4 Architecture Decision Records (ADRs)
   - Risk mitigation strategies for 5 identified risks
   - Success criteria checklist (17 items)

2. **research.md** - Technology decisions and best practices:
   - 5 research questions resolved (Better Auth JWT extraction, optimistic UI patterns, Server vs Client Components, Tailwind configuration, WCAG 2.1 compliance)
   - Technology stack decisions (Next.js App Router, Tailwind CSS, React hooks, lucide-react, sonner)
   - Best practices for component design, performance, accessibility, security
   - 4 open questions resolved (timestamps, filter persistence, delete confirmation, completed task styling)

3. **data-model.md** - Frontend state management:
   - State architecture (3 layers: Component State, Application State, API Client Layer)
   - Core entities (Task, TaskCreate, TaskUpdate, Session, ApiResponse)
   - State management patterns (optimistic updates with rollback)
   - Form validation logic
   - Search/filter state management
   - Error handling patterns
   - Performance considerations (memoization, debouncing, virtual scrolling)

4. **contracts/api-endpoints.md** - API integration documentation:
   - 8 endpoints documented (signup, login, getTasks, createTask, getTask, updateTask, deleteTask, toggleComplete)
   - Request/response schemas with TypeScript types
   - Error response format and HTTP status codes
   - Centralized API client implementation
   - Complete request/response examples
   - API contract testing patterns

5. **quickstart.md** - Development setup guide:
   - Prerequisites and initial setup (Node.js 18+, create-next-app)
   - Dependency installation (lucide-react, clsx, tailwind-merge, sonner, date-fns, better-auth)
   - Environment variable configuration (.env.local)
   - Tailwind CSS configuration with custom palette
   - TypeScript strict mode configuration
   - ESLint with jsx-a11y plugin
   - Project structure setup (directories, utility files, type definitions, API client)
   - Development workflow (dev server, build, tests, linting)
   - Common development tasks (adding components, pages, API endpoints)
   - Debugging guide (DevTools, common issues)
   - Testing strategy (unit, integration, E2E)
   - Performance optimization (code splitting, image optimization, memoization)
   - Deployment options (Vercel, Docker)

**Architecture Decision Records**:

1. **ADR-001: Next.js App Router vs Pages Router**
   - Decision: Use App Router for React Server Components support and route groups
   - Rationale: Modern approach, better TypeScript support, improved data fetching

2. **ADR-002: Optimistic UI Pattern**
   - Decision: Implement optimistic updates with error rollback for all mutations
   - Rationale: Instant feedback (50ms vs 200-500ms), improves perceived performance
   - Implementation: Immediate state update → API call → rollback on error

3. **ADR-003: Centralized API Client**
   - Decision: Single API client wrapper with automatic JWT injection
   - Rationale: Consistent JWT handling, single place for 401 redirects, easier to add retry logic

4. **ADR-004: Tailwind CSS with Custom Palette**
   - Decision: Extend Tailwind theme with semantic color names
   - Rationale: Utility-first reduces bundle size, custom palette ensures branding consistency

**Key Technical Decisions**:
- Three-tier architecture: UI components → data fetching hooks → API client layer
- Better Auth integration via getSession() for JWT extraction
- Optimistic UI with Pattern 1 (immediate update + rollback) for mutations, Pattern 2 (temp ID) for creates
- Server Components for static content, Client Components for interactivity
- Mobile-first responsive design (320px minimum width)
- WCAG 2.1 Level AA compliance (4.5:1 contrast, 44x44px touch targets, keyboard navigation)

**Constitution Compliance**:
- ✅ Principle VII: Professional UI & Brand Consistency (custom Tailwind config, no inline styles)
- ✅ Principle VIII: Component Architecture & Reusability (three-tier separation, TypeScript strict mode)
- ✅ Principle IX: Optimistic UI & Performance (skeleton loaders, optimistic updates, Next.js Link prefetching)
- ✅ Principle X: Responsive Design & Accessibility (mobile-first, WCAG 2.1 AA, keyboard navigation)
- ✅ Principle XI: Secure API Integration (centralized API client, automatic JWT injection)
- ✅ Principle XII: Form Validation & Error Handling (client-side + server-side, field-level errors)

**Risk Mitigation**:
1. Better Auth integration complexity → Abstraction layer in lib/auth.ts
2. Optimistic UI rollback bugs → Error boundaries, comprehensive tests
3. Mobile responsiveness at 320px → Test on real devices, fallback to 375px if needed
4. Session expiration data loss → Persist form data in sessionStorage
5. API latency on slow networks → 30-second timeout, skeleton loaders, retry buttons

**Agent Context Updated**:
- Added TypeScript 5.0+ with strict mode to CLAUDE.md
- Added frontend-only architecture note (no direct database access)

## Outcome

- ✅ Impact: Created comprehensive implementation plan with 5 planning artifacts (plan.md, research.md, data-model.md, contracts/api-endpoints.md, quickstart.md) covering architecture, technology decisions, state management, API integration, and development workflow. Plan includes 4 ADRs documenting key architectural decisions (App Router, optimistic UI, centralized API client, Tailwind CSS), 6 implementation phases with 14.5 hour estimate, constitution compliance verification for all 6 frontend principles, and risk mitigation strategies for 5 identified risks. Research phase resolved 5 technology questions and 4 open design questions. Agent context updated with TypeScript and frontend architecture.
- 🧪 Tests: No tests (planning documentation)
- 📁 Files: 5 files created - plan.md (comprehensive implementation plan with ADRs), research.md (technology decisions and best practices), data-model.md (frontend state management patterns), contracts/api-endpoints.md (8 API endpoints documented), quickstart.md (complete development setup guide), CLAUDE.md (agent context updated)
- 🔁 Next prompts: Run `/sp.tasks` to generate detailed task breakdown with test cases for implementation. Begin Phase 2.1 (Foundation) after task generation.
- 🧠 Reflection: Successfully completed planning workflow following SDD methodology. Phase 0 (Research) resolved all technology questions with clear decisions and rationale. Phase 1 (Design & Contracts) produced detailed data model, API contracts, and quickstart guide. Plan incorporates user-provided implementation phases while adding architectural rigor through ADRs, constitution compliance verification, and risk analysis. Three-tier architecture (UI → hooks → API client) ensures separation of concerns. Optimistic UI pattern with error rollback provides instant feedback while maintaining data consistency. Centralized API client with automatic JWT injection simplifies authentication integration. Mobile-first responsive design with WCAG 2.1 Level AA compliance ensures accessibility. All planning artifacts are implementation-ready with concrete examples, code snippets, and validation criteria.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning workflow completed successfully with all Phase 0 and Phase 1 artifacts generated. No NEEDS CLARIFICATION items remaining.
- Graders run and results (PASS/FAIL): PASS - All planning artifacts complete with concrete implementation details. Constitution compliance verified for all 6 frontend principles. ADRs document architectural decisions with rationale and alternatives considered. Research phase resolved all technology questions. Data model defines state management patterns with code examples. API contracts document all 8 endpoints with request/response schemas. Quickstart guide provides complete setup instructions.
- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided implementation phases integrated into planning structure
- Next experiment (smallest change to try): Proceed to `/sp.tasks` to validate that planning artifacts provide sufficient detail for task generation. Monitor whether ADRs need updates during implementation based on Better Auth integration complexity or optimistic UI rollback challenges.
