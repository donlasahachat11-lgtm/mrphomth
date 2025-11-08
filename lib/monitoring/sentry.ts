/**
 * Sentry Monitoring Utilities
 * Helper functions for error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Capture an exception with additional context
 */
export function captureException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
    user?: {
      id?: string
      email?: string
      username?: string
    }
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.withScope((scope) => {
    // Add tags
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    // Add extra context
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    // Add user context
    if (context?.user) {
      scope.setUser(context.user)
    }

    // Set level
    if (context?.level) {
      scope.setLevel(context.level)
    }

    Sentry.captureException(error)
  })
}

/**
 * Capture a message with additional context
 */
export function captureMessage(
  message: string,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    const level = context?.level || 'info'
    Sentry.captureMessage(message, level)
  })
}

/**
 * Start a span for performance monitoring
 */
export function startSpan<T>(
  name: string,
  op: string,
  callback: () => T | Promise<T>,
  data?: Record<string, string | number | boolean>
): T | Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: data as Record<string, string | number | boolean | undefined>,
    },
    callback
  )
}

/**
 * Track agent execution
 */
export function trackAgentExecution(
  agentName: string,
  agentNumber: number,
  projectId: string
) {
  return {
    finish: (status: 'success' | 'error', error?: Error) => {
      if (error) {
        Sentry.captureException(error, {
          tags: {
            agent: agentName,
            agentNumber: String(agentNumber),
            projectId,
          },
        })
      }
    },
  }
}

/**
 * Track workflow execution
 */
export function trackWorkflow(workflowId: string, userId: string) {
  let currentStep = 0
  let currentStepName = ''

  return {
    setStep: (step: number, stepName: string) => {
      currentStep = step
      currentStepName = stepName
      addBreadcrumb(`Step ${step}: ${stepName}`, 'workflow', 'info', {
        workflowId,
        step,
        stepName,
      })
    },
    
    finish: (status: 'success' | 'error', error?: Error) => {
      if (error) {
        Sentry.captureException(error, {
          tags: {
            workflowId,
            userId,
            step: String(currentStep),
          },
          extra: {
            currentStepName,
          },
        })
      }
    },
  }
}

/**
 * Set user context
 */
export function setUser(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser(user)
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null)
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  })
}
