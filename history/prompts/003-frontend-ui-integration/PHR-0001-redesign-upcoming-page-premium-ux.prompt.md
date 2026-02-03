---
id: PHR-0001
title: Redesign Upcoming Page Premium UX
stage: green
date: 2026-02-03
surface: agent
model: claude-sonnet-4-5-20250929
feature: 003-frontend-ui-integration
branch: 003-frontend-ui-integration
user: Jaweria-jiya
command: /sp.phr
labels: ["frontend", "ui-redesign", "upcoming-page", "premium-ux", "bug-fix", "task-duplication", "framer-motion", "navigation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/dashboard/upcoming/page.tsx
  - frontend/components/HorizontalDateStrip.tsx
  - frontend/components/WeekNavigator.tsx
  - frontend/components/MonthYearSelector.tsx
  - frontend/components/Calendar.tsx
  - frontend/components/UserMenu.tsx
  - frontend/components/tasks/AddTaskForm.tsx
  - frontend/components/tasks/TaskItem.tsx
  - frontend/app/dashboard/inbox/page.tsx
  - frontend/app/dashboard/today/page.tsx
tests:
  - none
---

## Prompt

Role: Act as a Senior UX/UI Engineer and React Developer. Objective: Redesign the Upcoming page to match a premium productivity app (like Todoist) using the provided design system.

1. Visual Architecture & Layout
Header Section: * Display a bold "Upcoming" title.

Under the title, place a Month/Year selector (e.g., February 2026). Clicking this should open a clean, floating mini-calendar dropdown (no internal dropdowns inside the calendar).

On the right side of the header, add navigation controls: "Today" button and chevron arrows (< and >) for week-to-week browsing.

Horizontal Date Strip: * Below the header, implement a horizontal 7-day row.

Each day should show the Day name (short) and Date.

The "Active/Selected" date must have a soft purple (#a47ec2) rounded-rectangle border or background.

Task List Area: * A vertical list grouped by date (e.g., "5 Feb · Thursday").

Add an inline "+ Add task" button under each date group.

2. Functional Requirements (The Logic Fixes)
Zero-Lag Navigation: Use client-side routing. Navigation between pages (Inbox, Upcoming, Today) must be instantaneous with zero page reloading or flickering.

Double-Entry Prevention: * Implement a throttle/debounce on the "Add Task" button and "Enter" key.

Disable the input/button for 800ms after the first click to prevent duplicate tasks from being created.

Cross-Page Sync: Any task added on the Upcoming page must automatically appear in the Inbox with the correct date badge attached.

Smooth Transitions: Use framer-motion for all dropdowns and page transitions (200ms ease-in-out).

3. Styling & Colors
Background: #F6E3BA (Cream).

Primary Accent: #a47ec2 (Lavender).

Text: #000000 (Black).

Sidebar Profile: Move the user profile circle to the sidebar. On click, it must open a vertical, elegant dropdown showing the full email and a "Logout" button. Ensure no focus borders appear on the circle.

4. Interaction Specs (The Edit Box)
When clicking "Edit" on a task:

The task row transforms into an input box.

Must show two buttons: Save (solid lavender) and Cancel (outline style).

## Response snapshot

Implemented a complete redesign of the Upcoming page using the nextjs-frontend-dev agent. Created three new components (HorizontalDateStrip, WeekNavigator, MonthYearSelector) and redesigned the Upcoming page with premium UX matching Todoist. Fixed critical task duplication bug by implementing 800ms debounce with state locking. Added Framer Motion transitions across all dashboard pages for smooth navigation. Updated Calendar component for floating dropdown usage and enhanced UserMenu with centered profile and no focus borders.

## Outcome

- ✅ Impact: Complete Upcoming page redesign with premium productivity app UX, critical bug fixes for task duplication, smooth page transitions, and enhanced user experience across the dashboard
- 🧪 Tests: TypeScript compilation passed (exit code 0), development server running successfully
- 📁 Files: 10 files modified/created including 3 new components (HorizontalDateStrip, WeekNavigator, MonthYearSelector) and updates to Upcoming, Calendar, UserMenu, AddTaskForm, TaskItem, Inbox, and Today pages
- 🔁 Next prompts: Test the implementation in browser, verify cross-page sync works correctly, check mobile responsiveness, consider adding keyboard shortcuts for week navigation
- 🧠 Reflection: The multi-agent approach (using nextjs-frontend-dev) was highly effective for this complex UI redesign. Breaking down the requirements into visual architecture, functional requirements, styling, and interactions provided clear implementation guidance. The 800ms debounce fix addresses a critical UX issue that could frustrate users.

## Evaluation notes (flywheel)

- Failure modes observed: Initial commit attempt failed due to Windows reserved filename "nul" in the repository. This was quickly resolved by removing the file. Line ending warnings (LF→CRLF) are expected on Windows but don't block functionality.
- Graders run and results (PASS/FAIL): PASS - TypeScript compilation successful, development server started without errors, all files staged and committed successfully
- Prompt variant (if applicable): Standard implementation prompt with detailed requirements broken into 4 sections (Visual Architecture, Functional Requirements, Styling, Interaction Specs)
- Next experiment (smallest change to try): Add automated visual regression testing to catch UI inconsistencies early. Consider implementing Storybook for component documentation and isolated testing.
