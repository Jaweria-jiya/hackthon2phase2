---
name: backend-skill
description: Build backend systems by generating API routes, handling requests and responses, and connecting to databases.
---

# Backend Development (Backend-Skill)

## Instructions

1. **Route Generation**
   - Define RESTful API routes
   - Use clear and consistent URL patterns
   - Separate public and protected routes
   - Group routes by feature/module

2. **Request & Response Handling**
   - Parse request parameters, body, and headers
   - Validate incoming data
   - Return structured JSON responses
   - Handle success and error responses consistently

3. **Database Connectivity**
   - Connect backend to the database (PostgreSQL / MySQL / MongoDB)
   - Use ORM or query builders where appropriate
   - Manage database connections efficiently
   - Handle database errors gracefully

4. **Business Logic Layer**
   - Keep controllers thin
   - Move logic to services
   - Reuse database queries
   - Avoid direct DB access inside routes

## Best Practices
- Follow REST or RPC conventions consistently
- Use proper HTTP status codes
- Centralize error handling
- Keep environment variables secure
- Log requests and errors for debugging

## Example Route Structure

```ts
// routes/user.ts
router.post("/users", createUser);
router.get("/users/:id", getUser);