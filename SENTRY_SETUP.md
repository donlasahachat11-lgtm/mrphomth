# Sentry Monitoring Setup Guide

This document explains how to set up Sentry for error tracking and performance monitoring in the Mr.Prompt application.

## What is Sentry?

Sentry is an error tracking and performance monitoring platform that helps you:
- Track and debug errors in production
- Monitor application performance
- Capture user session replays
- Get real-time alerts for issues
- Track release health

## Installation

Sentry has been installed and configured in this project:

```bash
pnpm add @sentry/nextjs
```

## Configuration Files

### 1. Sentry Client Config (`sentry.client.config.ts`)
Configures Sentry for browser/client-side tracking:
- Error tracking
- Performance monitoring
- Session replay
- Breadcrumbs

### 2. Sentry Server Config (`sentry.server.config.ts`)
Configures Sentry for server-side tracking:
- API route errors
- Server-side rendering errors
- Background job errors

### 3. Sentry Edge Config (`sentry.edge.config.ts`)
Configures Sentry for Edge Runtime:
- Middleware errors
- Edge API routes

### 4. Next.js Config (`next.config.mjs`)
Integrates Sentry with Next.js build process:
- Source map uploading
- Release tracking
- Build-time configuration

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Sentry DSN (required)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id

# Sentry Organization (optional, for source maps)
SENTRY_ORG=your-org-name

# Sentry Project (optional, for source maps)
SENTRY_PROJECT=your-project-name

# Sentry Auth Token (optional, for source maps)
SENTRY_AUTH_TOKEN=your-auth-token

# Enable Sentry in development (optional)
SENTRY_ENABLED=false
```

## Getting Your Sentry DSN

1. Go to [sentry.io](https://sentry.io/) and sign up/login
2. Create a new project or select an existing one
3. Go to **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**
4. Copy the DSN and add it to your `.env.local` file

## Features Implemented

### 1. Workflow Tracking
The orchestrator automatically tracks workflow execution:
- Start/end times
- Step-by-step progress
- Success/failure status
- Error details

```typescript
// Automatically tracked in WorkflowOrchestrator
const sentryTransaction = trackWorkflow(workflowId, userId)
sentryTransaction.setStep(1, 'Analyzing prompt')
sentryTransaction.finish('success')
```

### 2. Error Tracking
All errors are automatically captured with context:
- User information
- Workflow/project details
- Error stack traces
- Breadcrumbs

```typescript
captureException(error, {
  tags: { workflowId, userId },
  extra: { projectName, duration },
  level: 'error',
})
```

### 3. Breadcrumbs
Important events are logged as breadcrumbs:
- Workflow started
- Agent execution
- Step completion
- Workflow completed

```typescript
addBreadcrumb('Workflow started', 'workflow', 'info', {
  workflowId,
  projectName,
})
```

### 4. Performance Monitoring
Transaction tracking for:
- Workflow execution time
- Agent execution time
- API response times

## Usage in Code

### Capture an Exception

```typescript
import { captureException } from '@/lib/monitoring/sentry'

try {
  // Your code
} catch (error) {
  captureException(error, {
    tags: { feature: 'project-generation' },
    extra: { userId, projectId },
    level: 'error',
  })
}
```

### Capture a Message

```typescript
import { captureMessage } from '@/lib/monitoring/sentry'

captureMessage('User completed onboarding', {
  tags: { feature: 'onboarding' },
  level: 'info',
})
```

### Track Performance

```typescript
import { startTransaction } from '@/lib/monitoring/sentry'

const transaction = startTransaction('API Call', 'http.client')
// Your code
transaction.finish()
```

### Set User Context

```typescript
import { setUser } from '@/lib/monitoring/sentry'

setUser({
  id: user.id,
  email: user.email,
  username: user.username,
})
```

## Testing Sentry

### 1. Test in Development

Enable Sentry in development:

```bash
SENTRY_ENABLED=true pnpm dev
```

### 2. Trigger a Test Error

Create a test API route:

```typescript
// app/api/sentry-test/route.ts
export async function GET() {
  throw new Error('Sentry test error!')
}
```

Visit `/api/sentry-test` and check your Sentry dashboard.

### 3. Test Workflow Tracking

Generate a project and check Sentry for:
- Transaction traces
- Breadcrumbs
- Performance metrics

## Sentry Dashboard

After setup, you can view:

1. **Issues** - All captured errors
2. **Performance** - Transaction traces and metrics
3. **Releases** - Track deployments
4. **Alerts** - Configure notifications
5. **Discover** - Query and analyze data

## Best Practices

### 1. Don't Send Sensitive Data

The configuration already filters out:
- API keys
- Tokens
- Passwords
- Cookie headers

### 2. Set Appropriate Sample Rates

```typescript
// Production: 10% of transactions
tracesSampleRate: 0.1

// Development: 100% of transactions
tracesSampleRate: 1.0
```

### 3. Use Tags for Filtering

```typescript
captureException(error, {
  tags: {
    feature: 'project-generation',
    agent: 'agent1',
    environment: 'production',
  },
})
```

### 4. Add Context with Extra Data

```typescript
captureException(error, {
  extra: {
    userId,
    projectId,
    prompt: userPrompt,
    duration,
  },
})
```

## Deployment

### Vercel

Sentry works automatically on Vercel. Just add the environment variables:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_SENTRY_DSN`
3. (Optional) Add `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` for source maps

### Other Platforms

Ensure these environment variables are set:
- `NEXT_PUBLIC_SENTRY_DSN` (required)
- `SENTRY_AUTH_TOKEN` (optional, for source maps)

## Troubleshooting

### Sentry Not Capturing Errors

1. Check if DSN is set correctly
2. Verify `SENTRY_ENABLED=true` in development
3. Check browser console for Sentry initialization errors
4. Verify network requests to Sentry (should see POST to `sentry.io`)

### Source Maps Not Uploading

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry project
3. Run build with verbose logging: `pnpm build --verbose`

### Too Many Events

Adjust sample rates in Sentry configs:

```typescript
// Reduce transaction sampling
tracesSampleRate: 0.01 // 1%

// Reduce session replay sampling
replaysSessionSampleRate: 0.01 // 1%
```

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/)

## Support

For issues or questions:
1. Check Sentry documentation
2. Review error logs in Sentry dashboard
3. Contact the development team
