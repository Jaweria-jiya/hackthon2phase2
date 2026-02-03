---
name: frontend-skill
description: Build responsive frontend interfaces by creating pages, reusable components, and clean layout styling.
---

# Frontend Development (Frontend-Skill)

## Instructions

1. **Page Structure**
   - Create semantic HTML layouts
   - Organize pages by feature or route
   - Ensure accessibility (ARIA, labels)
   - Follow consistent file structure

2. **Component Design**
   - Build reusable UI components
   - Keep components small and focused
   - Pass data via props/state
   - Separate logic from presentation

3. **Layout & Styling**
   - Use Flexbox and Grid for layouts
   - Apply consistent spacing and typography
   - Implement responsive breakpoints
   - Use design tokens or utility classes

4. **State & Interaction**
   - Handle user interactions (click, input)
   - Manage local and global state
   - Display loading and error states
   - Optimize re-renders

## Best Practices
- Mobile-first responsive design
- Reuse components instead of duplicating UI
- Maintain consistent color and spacing system
- Avoid deeply nested layouts
- Test UI across screen sizes

## Example Component Structure

```jsx
function Card({ title, description }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}