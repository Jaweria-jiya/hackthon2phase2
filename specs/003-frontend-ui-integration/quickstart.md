# Quickstart Guide: Frontend UI & API Integration Layer

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-29
**Status**: Complete

## Prerequisites

Before starting development, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm or yarn**: Package manager
- **Git**: Version control
- **Better Auth**: Configured and running (Spec 1)
- **FastAPI Backend**: Running at http://localhost:4000 (Spec 2)
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

---

## Initial Setup

### 1. Create Next.js Project

```bash
# Navigate to project root
cd C:\Users\ALI\Desktop\hacka2phase2

# Create frontend directory
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Navigate to frontend
cd frontend
```

**Configuration prompts**:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: @/*

---

### 2. Install Dependencies

```bash
# Core dependencies
npm install lucide-react clsx tailwind-merge sonner date-fns

# Better Auth SDK (adjust based on actual Better Auth package)
npm install better-auth

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D eslint-plugin-jsx-a11y
```

**Dependency Purposes**:
- `lucide-react`: Icon library
- `clsx` + `tailwind-merge`: Utility class merging
- `sonner`: Toast notifications
- `date-fns`: Date formatting (relative time)
- `better-auth`: JWT session management
- `eslint-plugin-jsx-a11y`: Accessibility linting

---

### 3. Configure Environment Variables

Create `.env.local` in frontend directory:

```bash
# .env.local
BETTER_AUTH_SECRET=your-32-character-secret-here
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Important**:
- `BETTER_AUTH_SECRET` must match backend secret
- `NEXT_PUBLIC_API_URL` is exposed to browser (use NEXT_PUBLIC_ prefix)
- Never commit `.env.local` to version control

Create `.env.example` for documentation:

```bash
# .env.example
BETTER_AUTH_SECRET=<min-32-char-secret>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### 4. Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
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

---

### 5. Configure TypeScript

Update `tsconfig.json` for strict mode:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 6. Configure ESLint

Update `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error"
  }
}
```

---

## Project Structure Setup

### 7. Create Directory Structure

```bash
# Create directories
mkdir -p components/ui
mkdir -p lib/api
mkdir -p hooks
mkdir -p types
mkdir -p app/\(auth\)/signin
mkdir -p app/\(auth\)/signup
mkdir -p app/\(dashboard\)/tasks/new
mkdir -p app/\(dashboard\)/tasks/\[id\]
```

**Note**: On Windows, use PowerShell or escape parentheses in bash.

---

### 8. Create Utility Files

**lib/utils.ts** - Class name utility:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**lib/design-tokens.ts** - Design system constants:

```typescript
export const colors = {
  primary: '#a47ec2',
  secondary: '#F6E3BA',
  neutral: '#000000',
} as const

export const spacing = {
  cardPadding: '1.5rem',
  pagePadding: '2rem',
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const
```

---

### 9. Create Type Definitions

**types/task.ts**:

```typescript
export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
}
```

**types/auth.ts**:

```typescript
export interface User {
  id: string
  email: string
  name?: string
}

export interface Session {
  access_token: string
  user: User
  expires_at: string
}
```

**types/index.ts**:

```typescript
export * from './task'
export * from './auth'
```

---

### 10. Create API Client

**lib/api-client.ts**:

```typescript
import { getSession } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

  if (response.status === 401) {
    window.location.href = '/signin'
    throw new Error('Unauthorized')
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Request failed')
  }

  return data
}
```

**lib/api/tasks.ts**:

```typescript
import { apiRequest } from '@/lib/api-client'
import type { Task, TaskCreate, TaskUpdate } from '@/types'

export async function getTasks(userId: string): Promise<Task[]> {
  return apiRequest(`/api/${userId}/tasks`)
}

export async function createTask(userId: string, data: TaskCreate): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: TaskUpdate
): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  return apiRequest(`/api/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

export async function toggleComplete(userId: string, taskId: string): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
  })
}
```

---

## Development Workflow

### Running the Development Server

```bash
# Start Next.js development server
npm run dev

# Server starts at http://localhost:3000
```

**Hot Reload**: Changes to files automatically reload the browser.

---

### Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

**Build Output**: `.next/` directory contains optimized bundles.

---

### Running Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run E2E tests (Playwright)
npm run test:e2e
```

---

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint -- --fix

# Check TypeScript types
npx tsc --noEmit
```

---

## Common Development Tasks

### Adding a New Component

1. Create component file in `components/` or `components/ui/`
2. Define TypeScript interface for props
3. Use "use client" directive if interactive
4. Export component

**Example**:

```typescript
// components/ui/Button.tsx
'use client'

import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark',
        variant === 'secondary' && 'bg-secondary text-neutral hover:bg-secondary-dark',
        className
      )}
      {...props}
    />
  )
}
```

---

### Adding a New Page

1. Create directory in `app/` with route structure
2. Create `page.tsx` file
3. Export default component
4. Add to navigation if needed

**Example**:

```typescript
// app/(dashboard)/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getTasks } from '@/lib/api/tasks'
import type { Task } from '@/types'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks(userId)
        setTasks(data)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Tasks</h1>
      {/* Task list UI */}
    </div>
  )
}
```

---

### Adding a New API Endpoint

1. Add function to `lib/api/` directory
2. Use `apiRequest` helper
3. Define TypeScript types for request/response
4. Export function

**Example**:

```typescript
// lib/api/tasks.ts
export async function getTask(userId: string, taskId: string): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks/${taskId}`)
}
```

---

## Debugging

### Browser DevTools

**Console**: View logs, errors, warnings
```typescript
console.log('Task created:', task)
console.error('API error:', error)
```

**Network Tab**: Inspect API requests/responses
- Check request headers (Authorization header present?)
- Check response status codes
- View request/response payloads

**React DevTools**: Inspect component state and props
- Install React DevTools extension
- View component tree
- Inspect state and props

---

### Common Issues

**Issue**: "Unauthorized" error on API calls
**Solution**: Check JWT token in Authorization header, verify BETTER_AUTH_SECRET matches backend

**Issue**: CORS errors
**Solution**: Ensure backend CORS_ORIGINS includes http://localhost:3000

**Issue**: Tailwind classes not working
**Solution**: Check `tailwind.config.js` content paths include your files

**Issue**: TypeScript errors on build
**Solution**: Run `npx tsc --noEmit` to see all type errors, fix one by one

**Issue**: Environment variables not loading
**Solution**: Restart dev server after changing `.env.local`, ensure NEXT_PUBLIC_ prefix for client-side vars

---

## Testing Strategy

### Unit Tests

Test individual components in isolation:

```typescript
// components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with primary variant', () => {
    render(<Button variant="primary">Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-primary')
  })
})
```

---

### Integration Tests

Test component interactions with API:

```typescript
// tests/integration/task-crud.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TasksPage from '@/app/(dashboard)/tasks/page'

describe('Task CRUD', () => {
  it('creates a new task', async () => {
    render(<TasksPage />)

    const input = screen.getByLabelText(/title/i)
    await userEvent.type(input, 'New task')

    const button = screen.getByRole('button', { name: /create/i })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument()
    })
  })
})
```

---

### E2E Tests

Test complete user flows with Playwright:

```typescript
// tests/e2e/task-management.spec.ts
import { test, expect } from '@playwright/test'

test('user can create and complete a task', async ({ page }) => {
  await page.goto('http://localhost:3000/signin')

  // Sign in
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Create task
  await page.click('text=New Task')
  await page.fill('input[name="title"]', 'Buy groceries')
  await page.click('button:has-text("Save")')

  // Complete task
  await page.click('input[type="checkbox"]')

  // Verify completed
  await expect(page.locator('text=Buy groceries')).toHaveClass(/line-through/)
})
```

---

## Performance Optimization

### Code Splitting

Use dynamic imports for large components:

```typescript
import dynamic from 'next/dynamic'

const TaskForm = dynamic(() => import('@/components/TaskForm'), {
  loading: () => <div>Loading form...</div>,
})
```

---

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

---

### Memoization

Prevent unnecessary re-renders:

```typescript
import { useMemo } from 'react'

const filteredTasks = useMemo(() => {
  return tasks.filter(t => t.title.includes(searchQuery))
}, [tasks, searchQuery])
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables**: Add in Vercel dashboard under Settings → Environment Variables

---

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t todo-frontend .
docker run -p 3000:3000 todo-frontend
```

---

## Troubleshooting

### Reset Development Environment

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

---

### Check Backend Connection

```bash
# Test backend API
curl http://localhost:4000/api/health

# Expected response: {"status": "ok"}
```

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **React Documentation**: https://react.dev
- **Better Auth Documentation**: [Link to Better Auth docs]
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/

---

## Quickstart Complete

Development environment is ready. Follow the implementation phases in `plan.md` to build the frontend UI.

**Next Steps**:
1. Run `/sp.tasks` to generate detailed task breakdown
2. Start with Phase 2.1: Foundation (Tailwind setup, API client)
3. Commit changes frequently with descriptive messages
4. Run tests after each phase completion
