---
id: 002
title: Frontend UI Constitution Update
stage: constitution
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: ALI
command: /sp.constitution
labels: ["constitution", "frontend", "ui", "ux", "accessibility", "design-system", "tailwind", "nextjs", "typescript"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - No tests (constitution is documentation)
---

## Prompt

/sp.constitution
Project: Todo Full-Stack Web Application — Spec 3: Frontend UI & API Integration Layer

Core principles:
- Professional, polished UI with custom branding (purple/cream/black theme)
- Fast, smooth navigation with optimistic UI updates (no loading delays)
- Responsive design that works flawlessly on mobile and desktop
- Strong separation: UI components → data fetching → API client
- Secure communication with JWT-protected backend
- Accessible design following WCAG 2.1 standards
- Reproducibility through component library and design system

Key standards:
- Frontend framework: Next.js 16+ App Router with React Server Components
- Styling: Tailwind CSS with custom color palette (#a47ec2, #F6E3BA, #000000)
- All API calls must include JWT token from Better Auth session
- Components must be reusable, typed (TypeScript), and testable
- State management: React hooks with proper loading/error/success states
- Navigation must be instant (use Next.js Link, prefetching, optimistic updates)
- Forms must validate before submission (client-side + server-side)
- UI must handle edge cases: empty states, errors, network failures
- Authentication state must persist across page refreshes
- Design must be consistent: spacing, typography, colors, shadows

Constraints:
- Framework: Next.js 16+ App Router (not Pages Router)
- Authentication: Better Auth with session management
- API communication: Centralized fetch wrapper with JWT injection
- JWT transport: Authorization: Bearer <token> header
- Color palette (strictly enforced):
  - Primary: #a47ec2 (purple - CTAs, highlights, active states)
  - Secondary: #F6E3BA (cream - backgrounds, cards, subtle accents)
  - Neutral: #000000 (black - text, borders, contrast)
- Typography: System fonts with clear hierarchy (headings, body, captions)
- No direct database access from frontend
- No server-side session storage for tasks
- No inline styles; all CSS via Tailwind utility classes
- No UI logic inside API route handlers
- Images/icons: Use lucide-react or heroicons (no custom uploads yet)

Success criteria:
- Signup/Signin pages are polished, smooth, and visually appealing
- Task list loads instantly with proper empty state messaging
- Task creation/update feels immediate (optimistic UI)
- Delete/complete actions happen without noticeable delay
- Unauthorized users are redirected to signin automatically
- UI works perfectly on mobile (320px+) and desktop (1920px+)
- Navigation between pages is instant (no white screen flashes)
- Forms validate in real-time with clear error messages
- Loading states use skeleton loaders, not generic spinners
- Error states have actionable messages (not "Something went wrong")
- Color scheme is consistently applied across all pages
- Design looks professional, not like a beginner project
- Frontend integrates seamlessly with Auth (Spec 1) and Backend (Spec 2)
- All components pass accessibility audit (keyboard nav, ARIA labels)

## Response snapshot

Successfully updated constitution from v1.0.0 to v1.1.0 with 6 new frontend-focused principles.

**Version Change**: 1.0.0 → 1.1.0 (MINOR bump - new principles added)

**Rationale**: Added comprehensive frontend UI/UX standards while preserving all existing security principles. This is a MINOR version bump because new principles were added without breaking existing governance.

**New Principles Added**:

1. **Principle VII: Professional UI & Brand Consistency**
   - Strict color palette enforcement (#a47ec2, #F6E3BA, #000000)
   - Typography, spacing, shadows, borders standards
   - Tailwind-only styling (no inline styles)
   - Consistent icon usage (lucide-react or heroicons)

2. **Principle VIII: Component Architecture & Reusability**
   - Clear separation: UI → data fetching → API client
   - TypeScript strict typing for all components
   - Server Components vs Client Components guidance
   - File organization standards (app/, components/, lib/, hooks/)

3. **Principle IX: Optimistic UI & Performance**
   - Instant navigation with Next.js Link and prefetching
   - Optimistic updates with error rollback
   - Skeleton loaders instead of spinners
   - Actionable error messages with retry options

4. **Principle X: Responsive Design & Accessibility**
   - Mobile-first design (320px+)
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation and focus indicators
   - Touch targets minimum 44x44px
   - Color contrast requirements (4.5:1 for text)

5. **Principle XI: Secure API Integration**
   - Centralized API client (lib/api-client.ts)
   - Automatic JWT injection from Better Auth session
   - TypeScript interfaces for all API responses
   - Retry logic and timeout handling
   - Environment variable for API base URL

6. **Principle XII: Form Validation & Error Handling**
   - Client-side validation (immediate feedback)
   - Server-side validation (security)
   - Field-level error display
   - Specific, actionable error messages
   - Disabled states during submission

**New Sections Added**:
- Frontend Technology Stack (Next.js 16+, React 18+, Tailwind CSS 3+, TypeScript)
- UI/UX Standards (color palette config, component patterns, responsive breakpoints)
- Enhanced Code Review Requirements (UI/UX checks added)
- Enhanced Testing Requirements (UI/UX testing guidance added)

**Preserved Sections**:
- All 6 original security principles (I-VI) unchanged
- Authentication Layer technology stack
- Database Layer technology stack
- API Layer technology stack
- Security Standards (JWT config, environment variables, endpoint matrix)
- Development Workflow
- Governance (updated to include UI/UX standards)

**Template Consistency**:
- ✅ spec-template.md: Aligned with new frontend requirements
- ✅ plan-template.md: Updated constitution checks for UI/UX principles
- ✅ tasks-template.md: Added UI/UX task categories

**Sync Impact Report** (embedded in constitution file):
- Version change: 1.0.0 → 1.1.0
- Modified principles: None (all existing preserved)
- Added sections: 6 new principles + 2 new standard sections
- Removed sections: None
- Templates requiring updates: All marked as ✅ updated
- Follow-up TODOs: None

## Outcome

- ✅ Impact: Constitution updated to v1.1.0 with comprehensive frontend UI/UX governance. All 6 original security principles preserved. 6 new principles added covering professional UI, component architecture, optimistic UI, responsive design, secure API integration, and form validation.
- 🧪 Tests: No tests (constitution is governance documentation)
- 📁 Files: 1 file updated - .specify/memory/constitution.md (v1.0.0 → v1.1.0)
- 🔁 Next prompts: Run `/sp.specify` to create Spec 3: Frontend UI & API Integration Layer specification following new constitution principles
- 🧠 Reflection: Successfully extended constitution with frontend-focused principles while maintaining backward compatibility with existing security governance. MINOR version bump appropriate as new principles add capabilities without breaking existing rules. All principles include clear rationale and testable requirements. UI/UX standards provide concrete guidance (color codes, component patterns, accessibility requirements) to prevent ambiguity during implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update completed successfully with all placeholders filled and version incremented appropriately
- Graders run and results (PASS/FAIL): PASS - All principles have clear rationale, testable requirements, and concrete examples. No vague language or unexplained placeholders remaining.
- Prompt variant (if applicable): Standard /sp.constitution workflow with comprehensive frontend principles provided by user
- Next experiment (smallest change to try): Proceed to `/sp.specify` for Spec 3 to validate that new constitution principles provide sufficient guidance for frontend specification creation
