/**
 * Sentry Server Configuration
 * This file configures Sentry for the server-side (API routes, SSR)
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Sentry DSN (Data Source Name)
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLED) {
      return null
    }

    // Remove sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const env = event.contexts.runtime.env as Record<string, unknown>
      delete env.SUPABASE_SERVICE_ROLE_KEY
      delete env.VC_API_KEY
      delete env.VERCEL_TOKEN
      delete env.GITHUB_TOKEN
    }

    // Remove sensitive request data
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, unknown>
      delete headers.authorization
      delete headers.cookie
    }

    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    // Expected database errors
    'duplicate key value',
    'violates foreign key constraint',
    // Expected auth errors
    'AuthSessionMissingError',
    'Invalid Refresh Token',
    // Network timeouts (expected)
    'ETIMEDOUT',
    'ECONNRESET',
  ],
})
