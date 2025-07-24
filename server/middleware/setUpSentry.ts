import * as Sentry from '@sentry/node'
import express from 'express'
import config from '../config'
import applicationVersion from '../applicationVersion'

export function setUpSentryRequestHandler(): void {
  if (config.sentry.dsn) {
    // Prevent usernames which are PII from being sent to Sentry
    // https://docs.sentry.io/platforms/python/guides/logging/data-management/sensitive-data/#examples
    const anonymousId = Math.random().toString()
    Sentry.setUser({ id: anonymousId, username: anonymousId })

    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      release: applicationVersion.gitRef,
      sendDefaultPii: false,
      tracesSampler: ({ name }) => {
        if (name.includes('ping') || name.includes('health') || name.includes('assets')) {
          return 0
        }

        if (config.environment === 'prod') {
          return 1
        }

        // Default sample rate
        return 0.05
      },
    })
  }
}

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)
  }
}
