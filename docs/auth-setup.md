# Authentication Setup Guide

## Overview

This guide explains how to set up authentication for the Todo Full-Stack Web Application using Better Auth (frontend) and FastAPI (backend) with JWT tokens.

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- Neon PostgreSQL database account
- OpenSSL (for generating secrets)

## Step 1: Generate Shared Secret

The frontend and backend MUST use the same secret for JWT signing and verification.

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for both services.

## Step 2: Backend Environment Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your values:
```env
BETTER_AUTH_SECRET=<paste-your-generated-secret>
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
CORS_ORIGINS=http://localhost:3000
```

**Important**: Replace `DATABASE_URL` with your actual Neon connection string.

4. Install dependencies:
```bash
pip install -r requirements.txt
```

## Step 3: Frontend Environment Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Edit `.env.local` and add your values:
```env
BETTER_AUTH_SECRET=<same-secret-as-backend>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Critical**: The `BETTER_AUTH_SECRET` MUST be identical to the backend.

4. Install dependencies:
```bash
npm install
```

## Step 4: Database Setup

The database tables will be created automatically when you start the backend server for the first time.

Tables created:
- `users` - User accounts with hashed passwords
- `tasks` - Todo items linked to users

## Step 5: Start the Services

### Start Backend (Terminal 1):
```bash
cd backend
uvicorn app.main:app --reload --port 4000
```

### Start Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

## Step 6: Verify Setup

1. Open browser to `http://localhost:3000`
2. Click "Sign Up" and create an account
3. Log in with your credentials
4. You should receive a JWT token and be redirected to the dashboard

## Troubleshooting

### "Invalid token" errors
- Verify `BETTER_AUTH_SECRET` is identical in both `.env` files
- Check that the secret is at least 32 characters

### CORS errors
- Verify `CORS_ORIGINS` in backend `.env` matches your frontend URL
- Default is `http://localhost:3000`

### Database connection errors
- Verify your Neon connection string is correct
- Ensure `?sslmode=require` is included in the connection string

### Token expiry
- Tokens expire after 7 days by default
- Users will be redirected to login when token expires

## Security Notes

- Never commit `.env` or `.env.local` files to version control
- Use strong, randomly generated secrets (minimum 32 characters)
- In production, use HTTPS for all communication
- Rotate secrets periodically for enhanced security
