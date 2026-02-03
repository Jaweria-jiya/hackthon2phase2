---
name: auth-skill
description: Design and implement secure authentication systems including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Authentication System (Auth-Skill)

## Instructions

1. **Core Features**
   - User signup and signin flows
   - Secure password hashing
   - JWT-based authentication
   - Session and token validation

2. **Security Implementation**
   - Hash passwords using bcrypt or argon2
   - Never store plain-text passwords
   - Use access tokens + refresh tokens
   - Protect private routes with middleware/guards

3. **JWT Handling**
   - Generate JWT on successful signin
   - Include user ID and role in payload
   - Set token expiration
   - Verify token on every protected request

4. **Better Auth Integration**
   - Configure Better Auth provider
   - Connect signup/signin to Better Auth APIs
   - Sync user sessions and tokens
   - Handle logout and token revocation

## Best Practices
- Validate input on both client and server
- Use HTTPS only for auth requests
- Store JWT securely (httpOnly cookies preferred)
- Rotate and expire tokens regularly
- Centralize auth logic in a dedicated module

## Example Flow

```ts
// Signup
POST /auth/signup
→ hash password
→ store user
→ return success

// Signin
POST /auth/signin
→ verify password
→ generate JWT
→ return token

// Protected Route
GET /user/profile
→ verify JWT
→ allow access
