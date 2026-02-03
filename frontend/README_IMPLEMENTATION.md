# Todo App Frontend - Complete Implementation

## Overview
This is a complete, production-ready Todo App UI built with Next.js 14+ App Router, featuring a modern design with the specified color scheme.

## Design System
- **Background**: #F6E3BA (light beige/cream)
- **Accent/Interactive**: #a47ec2 (purple)
- **Text/Icons**: #000000 (black)

## Project Structure

### Pages
- `/dashboard/tasks` - Main tasks page (My Tasks)
- `/dashboard/today` - Tasks scheduled for today
- `/dashboard/inbox` - All scheduled tasks with dates
- `/dashboard/upcoming` - Calendar view for scheduling future tasks
- `/dashboard/completed` - Completed tasks list

### Components

#### Layout Components
- `components/Navbar.tsx` - Top navigation with logo and user menu
- `components/Sidebar.tsx` - Left sidebar navigation
- `components/UserMenu.tsx` - User avatar dropdown with sign out

#### Task Components
- `components/tasks/TaskList.tsx` - Renders list of tasks
- `components/tasks/TaskItem.tsx` - Individual task with checkbox, edit, delete
- `components/tasks/AddTaskForm.tsx` - Form to add new tasks

#### Calendar Component
- `components/Calendar.tsx` - Interactive calendar for scheduling tasks

### API Integration
- `lib/api.ts` - Complete API client with JWT authentication
- `types/task.ts` - TypeScript type definitions

## Features Implemented

### 1. Header Component
- Left: "Todo App" title in black
- Right: Circular avatar with first letter of user's email
- Avatar dropdown showing full email and "Sign Out" option
- Smooth dropdown animation

### 2. Sidebar Navigation
- Left panel with navigation links:
  - Today
  - Inbox
  - Upcoming
  - Completed
- Active link highlighted with purple (#a47ec2)
- Smooth transitions

### 3. My Tasks (Dashboard)
- Heading: "My Tasks" with subtitle
- "Add New Task" input field
- Add task on Enter key press or button click
- Task list with:
  - Checkbox to mark complete
  - Task description
  - Edit icon for inline editing
  - Delete button with smooth animation

### 4. Today Page
- Display tasks scheduled for current day
- Add tasks directly to today
- Same task item structure

### 5. Inbox Page
- List all scheduled tasks
- Show task description
- Display calendar icon + scheduled date

### 6. Upcoming Page
- Heading: "Upcoming Tasks"
- Current month/year with dropdown
- Interactive calendar for 2026 and 2027
- Calendar allows date selection
- Selected date tasks appear with add form

### 7. Completed Page
- List completed tasks
- Visual indication of completion
- Delete button for each task

## Technical Implementation

### TypeScript
- Complete type safety with interfaces
- Type definitions for all props and API responses

### Tailwind CSS
- Custom color palette configured
- Responsive design (mobile-first)
- Smooth animations and transitions

### API Integration
- JWT token authentication in headers
- Endpoints: GET/POST/PUT/DELETE/PATCH
- Error handling with toast notifications
- Loading states

### State Management
- React hooks (useState, useEffect)
- Optimistic UI updates
- Local state for tasks

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Focus indicators

### UX Features
- Fast, responsive interactions
- Toast notifications (sonner)
- Subtle shadows for depth
- Consistent spacing and typography
- Inline editing for tasks
- Smooth animations for add/delete/complete

## Running the Application

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:9000
BETTER_AUTH_SECRET=your-secret-key
```

## API Endpoints Used

- `GET /api/{user_id}/tasks` - Get all tasks
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- All components are client components due to interactivity requirements
- JWT token stored in localStorage
- Protected routes with authentication check
- Responsive design works on mobile, tablet, and desktop
