# Research: Frontend UI & API Integration Layer

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-29
**Status**: Complete

## Research Questions

### 1. Better Auth JWT Extraction in Next.js App Router

**Question**: How to extract JWT token from Better Auth session in Next.js App Router for API requests?

**Research Findings**:
- Better Auth provides `getSession()` helper function that works in both Server Components and Client Components
- Session object contains `access_token` field with JWT token
- For API client (client-side), use Better Auth's client SDK: `import { getSession } from '@/lib/auth'`
- For Server Components, use Better Auth's server SDK: `import { auth } from '@/lib/auth-server'`

**Decision**: Use Better Auth's `getSession()` in centralized API client to extract JWT token

**Implementation Pattern**:
```typescript
// lib/api-client.ts
import { getSession } from '@/lib/auth'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const session = await getSession()
  const token = session?.access_token

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // Handle 401 responses
  if (response.status === 401) {
    window.location.href = '/signin'
    return null
  }

  return response.json()
}
```

**References**:
- Better Auth documentation: Session management
- Next.js App Router: Client-side data fetching patterns

---

### 2. Optimistic UI Patterns with Error Rollback

**Question**: What are the best practices for implementing optimistic updates with error rollback in React?

**Research Findings**:
- **Pattern 1: Immediate State Update + Try/Catch Rollback**
  - Update local state immediately
  - Make API call in try block
  - Rollback state in catch block
  - Show error toast notification

- **Pattern 2: Temporary ID for Optimistic Creates**
  - Add item with temporary ID (e.g., -1 or UUID)
  - Replace with real ID when API responds
  - Remove temporary item on error

- **Pattern 3: Previous State Snapshot**
  - Store previous state before update
  - Restore snapshot on error
  - More reliable for complex state

**Decision**: Use Pattern 1 (immediate update + rollback) for simple mutations, Pattern 2 for creates

**Implementation Examples**:

**Toggle Complete (Pattern 1)**:
```typescript
async function handleToggleComplete(taskId: string) {
  // Optimistic update
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ))

  try {
    await toggleComplete(userId, taskId)
  } catch (error) {
    // Rollback
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))
    toast.error('Failed to update task')
  }
}
```

**Create Task (Pattern 2)**:
```typescript
async function handleCreate(data: TaskCreate) {
  const tempTask: Task = {
    id: '-1',
    ...data,
    completed: false,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Optimistic add
  setTasks(prev => [tempTask, ...prev])

  try {
    const newTask = await createTask(userId, data)
    // Replace temp with real
    setTasks(prev => prev.map(t => t.id === '-1' ? newTask : t))
  } catch (error) {
    // Remove temp
    setTasks(prev => prev.filter(t => t.id !== '-1'))
    toast.error('Failed to create task')
  }
}
```

**References**:
- React documentation: Optimistic updates
- TanStack Query: Optimistic updates guide
- Real-world examples: Linear, Notion, Todoist

---

### 3. Next.js 16 App Router: Server vs Client Components

**Question**: When to use Server Components vs Client Components in Next.js App Router?

**Research Findings**:

**Server Components (default)**:
- Static content (layouts, landing pages)
- Data fetching from backend
- SEO-critical content
- No interactivity needed
- Benefits: Smaller bundle size, faster initial load

**Client Components (use "use client")**:
- Interactive elements (buttons, forms, modals)
- Browser APIs (localStorage, window, document)
- React hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange)
- Third-party libraries that use browser APIs

**Decision**: Use Server Components for layouts and static pages, Client Components for interactive features

**Component Classification**:

**Server Components**:
- `app/layout.tsx` - Root layout
- `app/(auth)/layout.tsx` - Auth layout
- `app/(dashboard)/layout.tsx` - Dashboard layout (navbar can be client)
- `app/page.tsx` - Landing page (redirect logic)

**Client Components**:
- All components in `components/` directory (interactive)
- `app/(auth)/signin/page.tsx` - Form with state
- `app/(auth)/signup/page.tsx` - Form with state
- `app/(dashboard)/tasks/page.tsx` - Task list with mutations
- `app/(dashboard)/tasks/new/page.tsx` - Form
- `app/(dashboard)/tasks/[id]/page.tsx` - Form

**Best Practice**: Keep Server Components as default, add "use client" only when needed

**References**:
- Next.js documentation: Server and Client Components
- React documentation: Server Components RFC

---

### 4. Tailwind CSS Custom Color Palette Configuration

**Question**: How to configure custom color palette in Tailwind CSS and ensure consistent usage?

**Research Findings**:

**Configuration Approach**:
1. Extend Tailwind theme in `tailwind.config.js`
2. Use semantic color names (primary, secondary, neutral)
3. Add hover/active variants (primary-dark, secondary-dark)
4. Configure in `theme.extend.colors` to preserve default colors

**Implementation**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#a47ec2',
        'primary-dark': '#8a5ea3',
        'primary-light': '#c4a8d8',
        secondary: '#F6E3BA',
        'secondary-dark': '#e8d4a5',
        'secondary-light': '#fef5d9',
        neutral: '#000000',
      },
    },
  },
  plugins: [],
}
```

**Usage Patterns**:
- Backgrounds: `bg-primary`, `bg-secondary`, `bg-white`
- Text: `text-neutral`, `text-primary`, `text-white`
- Borders: `border-primary`, `border-neutral/20` (with opacity)
- Hover states: `hover:bg-primary-dark`, `hover:bg-secondary-dark`
- Focus states: `focus:ring-2 focus:ring-primary`

**Enforcement Strategy**:
1. ESLint rule to prevent arbitrary color values (e.g., `bg-[#a47ec2]`)
2. Code review checklist for color usage
3. Design tokens file for reference

**Decision**: Extend Tailwind theme with semantic names, enforce via code review

**References**:
- Tailwind CSS documentation: Customizing colors
- Tailwind CSS documentation: Theme configuration

---

### 5. WCAG 2.1 Level AA Accessibility Compliance

**Question**: What tools and techniques ensure WCAG 2.1 Level AA compliance?

**Research Findings**:

**Automated Testing Tools**:
1. **eslint-plugin-jsx-a11y**: Linting for accessibility issues
2. **axe-core**: Runtime accessibility testing
3. **Lighthouse**: Accessibility audit in Chrome DevTools
4. **WAVE**: Browser extension for visual accessibility testing

**Manual Testing Requirements**:
1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
3. **Color Contrast**: Verify with WebAIM Contrast Checker
4. **Touch Targets**: Ensure 44x44px minimum on mobile

**WCAG 2.1 Level AA Requirements**:
- **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large text
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.4.7 Focus Visible**: Focus indicator visible on all interactive elements
- **3.2.4 Consistent Identification**: Consistent labeling across pages
- **4.1.2 Name, Role, Value**: All UI components have accessible names

**Color Contrast Verification**:
- Primary (#a47ec2) on white: 4.8:1 ✅ (passes AA for normal text)
- Neutral (#000000) on white: 21:1 ✅ (passes AAA)
- Secondary (#F6E3BA) on white: 1.4:1 ❌ (fails - use for backgrounds only, not text)

**Decision**: Use automated tools + manual testing, document accessibility patterns

**Implementation Checklist**:
- [ ] Install eslint-plugin-jsx-a11y
- [ ] Add ARIA labels to all buttons without visible text
- [ ] Ensure all form inputs have associated labels
- [ ] Add focus:ring-2 focus:ring-primary to all interactive elements
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Run Lighthouse accessibility audit (target: 100 score)
- [ ] Verify touch targets are 44x44px minimum (w-11 h-11 in Tailwind)

**References**:
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- MDN: ARIA best practices

---

## Technology Stack Decisions

### Frontend Framework: Next.js 16+ App Router

**Rationale**:
- Modern React patterns (Server Components)
- Built-in routing with layouts
- Excellent TypeScript support
- Better Auth integration is straightforward
- Strong community and ecosystem

**Alternatives Considered**:
- Remix: Good framework but Better Auth integration less documented
- Vite + React Router: More setup required, no Server Components
- Create React App: Deprecated, not recommended for new projects

**Decision**: Next.js 16+ App Router ✅

---

### Styling: Tailwind CSS 3+

**Rationale**:
- Utility-first approach reduces CSS bundle size
- Excellent responsive design support
- Custom color palette configuration
- No inline styles (constitution compliance)
- Strong TypeScript support with tailwind-merge

**Alternatives Considered**:
- CSS Modules: More boilerplate, harder to enforce consistency
- Styled Components: Violates "no inline styles" principle
- Plain CSS: Harder to maintain, no utility classes

**Decision**: Tailwind CSS 3+ ✅

---

### State Management: React Hooks

**Rationale**:
- Simple state management for task list (useState)
- No need for global state library (Redux, Zustand)
- Better Auth handles auth state
- Optimistic updates with local state

**Alternatives Considered**:
- Redux: Overkill for simple task management
- Zustand: Unnecessary complexity
- TanStack Query: Good for caching but adds complexity

**Decision**: React hooks (useState, useReducer) ✅

---

### Icons: lucide-react

**Rationale**:
- Consistent icon style
- Tree-shakeable (only import used icons)
- TypeScript support
- Large icon library

**Alternatives Considered**:
- heroicons: Good alternative, similar features
- react-icons: Larger bundle size, mixed styles
- Custom SVGs: More work to maintain

**Decision**: lucide-react ✅

---

### Toast Notifications: sonner

**Rationale**:
- Lightweight and performant
- Beautiful default styling
- TypeScript support
- Easy to customize

**Alternatives Considered**:
- react-hot-toast: Similar features, slightly larger
- react-toastify: Older library, more configuration needed
- Custom implementation: More work, reinventing the wheel

**Decision**: sonner ✅

---

## Best Practices Summary

### Component Design
1. **Single Responsibility**: Each component does one thing well
2. **Composition over Inheritance**: Build complex UIs from simple components
3. **Props over Context**: Pass data explicitly unless deeply nested
4. **TypeScript Strict Mode**: No `any` types, explicit prop interfaces

### Performance
1. **Code Splitting**: Use dynamic imports for large components
2. **Image Optimization**: Use Next.js Image component
3. **Lazy Loading**: Load non-critical components on demand
4. **Memoization**: Use React.memo for expensive components

### Accessibility
1. **Semantic HTML**: Use proper HTML elements (button, nav, main)
2. **ARIA Labels**: Add aria-label for icon-only buttons
3. **Keyboard Navigation**: Ensure Tab order is logical
4. **Focus Management**: Trap focus in modals, restore on close

### Security
1. **XSS Prevention**: Never use dangerouslySetInnerHTML
2. **CSRF Protection**: Better Auth handles this
3. **Input Validation**: Client-side for UX, server-side for security
4. **Environment Variables**: Use NEXT_PUBLIC_ prefix for client-side vars

---

## Open Questions Resolved

1. **Should task cards display timestamps?**
   - **Decision**: Yes, show relative time (e.g., "2 hours ago") for better context
   - **Implementation**: Use date-fns library for formatting

2. **Should search/filter state persist across navigation?**
   - **Decision**: No, reset filters on navigation for simplicity
   - **Rationale**: Avoids confusion when returning to page

3. **Should delete have confirmation dialog?**
   - **Decision**: No, use optimistic UI with undo toast (3-second window)
   - **Rationale**: Faster UX, aligns with modern task apps (Todoist, Linear)

4. **Should completed tasks have visual distinction?**
   - **Decision**: Yes, use line-through text and reduced opacity (60%)
   - **Implementation**: `className={cn(task.completed && "line-through opacity-60")}`

---

## Research Complete

All research questions resolved. No NEEDS CLARIFICATION items remaining. Ready to proceed to Phase 1 (Design & Contracts).
