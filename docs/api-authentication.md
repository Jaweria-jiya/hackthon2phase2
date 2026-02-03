# API Authentication Guide

## Overview

This API uses JWT (JSON Web Tokens) for authentication. All protected endpoints require a valid JWT token in the Authorization header.

## Authentication Flow

1. **Sign Up**: Create a new account
2. **Sign In**: Receive JWT token
3. **Use Token**: Include token in all API requests
4. **Token Expires**: After 7 days, re-authenticate

## Obtaining a JWT Token

### Sign Up

**Endpoint**: `POST /api/auth/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (201 Created):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "message": "Account created successfully"
}
```

### Sign In

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Using the JWT Token

Include the token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example with curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:4000/api/USER_ID/tasks
```

### Example with JavaScript:
```javascript
const response = await fetch('http://localhost:4000/api/USER_ID/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Protected Endpoints

All task endpoints require authentication:

- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{id}` - Get task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

**Important**: The `user_id` in the URL MUST match the user_id in your JWT token.

## Error Responses

### 401 Unauthorized

**Causes**:
- Missing Authorization header
- Invalid token format
- Expired token (after 7 days)
- Invalid signature

**Response**:
```json
{
  "detail": "Invalid token: Token expired"
}
```

**Solution**: Log in again to get a new token.

### 403 Forbidden

**Cause**: Attempting to access another user's resources

**Response**:
```json
{
  "detail": "Access denied: user_id mismatch"
}
```

**Solution**: Ensure the `user_id` in the URL matches your authenticated user.

### 404 Not Found

**Causes**:
- Resource doesn't exist
- Resource belongs to another user (security measure)

**Response**:
```json
{
  "detail": "Task not found"
}
```

## Token Details

### Token Structure

JWT tokens contain three parts (header.payload.signature):

**Payload**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "email": "user@example.com",
  "iat": 1706544000,  // Issued at (Unix timestamp)
  "exp": 1707148800   // Expiration (Unix timestamp)
}
```

### Token Expiration

- **Default**: 7 days (604800 seconds)
- **Behavior**: After expiration, all API requests return 401
- **Handling**: Frontend automatically redirects to login page

## Security Best Practices

1. **Never expose tokens**: Don't log tokens or include them in URLs
2. **Store securely**: Use httpOnly cookies or secure storage
3. **HTTPS only**: Always use HTTPS in production
4. **Short-lived tokens**: Consider shorter expiration for sensitive apps
5. **Logout**: Clear tokens from storage when logging out

## Testing Authentication

### Test with valid token:
```bash
# Should return your tasks
curl -H "Authorization: Bearer VALID_TOKEN" \
     http://localhost:4000/api/YOUR_USER_ID/tasks
```

### Test with invalid token:
```bash
# Should return 401 Unauthorized
curl -H "Authorization: Bearer invalid_token" \
     http://localhost:4000/api/YOUR_USER_ID/tasks
```

### Test with wrong user_id:
```bash
# Should return 403 Forbidden
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/api/DIFFERENT_USER_ID/tasks
```

## Common Issues

### "Missing authentication token"
- Ensure Authorization header is included
- Format: `Authorization: Bearer <token>`

### "Token expired"
- Token is older than 7 days
- Solution: Log in again to get a new token

### "Access denied: user_id mismatch"
- URL user_id doesn't match token user_id
- Solution: Use your own user_id in the URL

### CORS errors
- Backend CORS_ORIGINS doesn't include your frontend URL
- Check backend `.env` file

## API Documentation

Full interactive API documentation available at:
- Swagger UI: `http://localhost:4000/docs`
- ReDoc: `http://localhost:4000/redoc`
