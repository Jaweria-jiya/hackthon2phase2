# Vercel Deployment Guide

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Production backend API deployed and accessible
- Git repository connected to Vercel

---

## Environment Variables

### Required Variables

You **MUST** set these environment variables in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Production backend API URL | `https://api.yourdomain.com` |
| `BETTER_AUTH_SECRET` | JWT secret (must match backend) | `PDvJcYDnogs3o0GWoiecYgEVom7T0Nf8YiRHj+gte6g=` |

### How to Set Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your production backend URL (e.g., `https://api.yourdomain.com`)
   - **Environments**: Select `Production`, `Preview`, and `Development`
4. Click **Save**
5. Repeat for `BETTER_AUTH_SECRET`

**Important**: After adding environment variables, you must redeploy your application for changes to take effect.

---

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Select the `frontend` directory as the root directory

2. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Set Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` with your production backend URL
   - Add `BETTER_AUTH_SECRET` (must match your backend)

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (usually 2-3 minutes)

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add BETTER_AUTH_SECRET production
```

---

## Build Configuration

### next.config.js

The current configuration is production-ready:

```javascript
const nextConfig = {
  reactStrictMode: true,
}
```

**No changes needed** - this is the minimal, safe configuration for Vercel.

---

## Common Deployment Issues & Solutions

### Issue 1: "Failed to fetch" errors in production

**Cause**: `NEXT_PUBLIC_API_URL` is not set or points to localhost

**Solution**:
1. Verify environment variable is set in Vercel dashboard
2. Ensure the value is your production backend URL (not localhost)
3. Redeploy after setting the variable

### Issue 2: Authentication not working

**Cause**: `BETTER_AUTH_SECRET` mismatch between frontend and backend

**Solution**:
1. Ensure both frontend and backend use the **exact same** secret
2. Check for trailing spaces or newlines in the secret
3. Redeploy both services after updating

### Issue 3: CORS errors

**Cause**: Backend not configured to accept requests from Vercel domain

**Solution**:
Update your backend CORS configuration to include your Vercel domain:
```python
# backend/main.py
CORS_ORIGINS = [
    "https://your-app.vercel.app",
    "https://your-custom-domain.com",
]
```

### Issue 4: Build fails with "socket hang up"

**Cause**: Network issues during build (rare with this project)

**Solution**:
1. This project uses `next/font/google` which is optimized for Vercel
2. If build fails, click "Redeploy" in Vercel dashboard
3. Check Vercel status page: https://www.vercel-status.com/

---

## Production Checklist

Before deploying to production, verify:

- [ ] Backend API is deployed and accessible
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `BETTER_AUTH_SECRET` matches between frontend and backend
- [ ] Backend CORS allows your Vercel domain
- [ ] Database is configured and accessible from backend
- [ ] All environment variables are set in Vercel
- [ ] Test signup/login flow after deployment
- [ ] Test task CRUD operations after deployment

---

## Post-Deployment Testing

After deployment, test these critical flows:

1. **Authentication**
   - Sign up with a new account
   - Log in with existing account
   - Verify JWT token is stored correctly

2. **Task Management**
   - Create a new task
   - Edit a task
   - Mark task as complete
   - Delete a task

3. **Navigation**
   - Test all dashboard routes (Inbox, Today, Upcoming, Completed)
   - Verify protected routes redirect to login when not authenticated

---

## Monitoring & Debugging

### View Deployment Logs

1. Go to Vercel Dashboard → Your Project
2. Click on the deployment
3. View **Build Logs** and **Function Logs**

### Common Log Messages

- `✓ Compiled successfully` - Build succeeded
- `Error: Failed to fetch` - Check `NEXT_PUBLIC_API_URL`
- `401 Unauthorized` - Check JWT secret configuration
- `CORS error` - Update backend CORS settings

---

## Custom Domain Setup (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update backend CORS to include custom domain

---

## Rollback Strategy

If deployment fails or has issues:

1. Go to **Deployments** in Vercel Dashboard
2. Find the last working deployment
3. Click **⋯** → **Promote to Production**

---

## Performance Optimization

This project is already optimized for production:

- ✅ Using `next/font/google` for font optimization
- ✅ React Strict Mode enabled
- ✅ Automatic code splitting by Next.js
- ✅ Static page generation where possible
- ✅ Optimized bundle sizes

---

## Security Considerations

- ✅ JWT tokens stored in localStorage (consider httpOnly cookies for enhanced security)
- ✅ No secrets in client-side code
- ✅ Environment variables properly configured
- ✅ CORS configured on backend
- ✅ Input validation on all forms

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test backend API independently
4. Check browser console for client-side errors
5. Review Vercel documentation: https://vercel.com/docs

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
