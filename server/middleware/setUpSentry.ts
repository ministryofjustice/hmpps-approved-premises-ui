import * as Sentry from '@sentry/node'
import { Express } from 'express'
import config from '../config'
import applicationVersion from '../applicationVersion'

export const initSentry = () => {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.environment,
    release: applicationVersion.gitRef,
    integrations: [Sentry.httpIntegration()],
    tracesSampler: samplingContext => {
      const transactionName = samplingContext?.transactionContext?.name
      if (
        transactionName?.includes('ping') ||
        transactionName?.includes('health') ||
        transactionName?.includes('assets')
      ) {
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

export function setupSentry(app: Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)

    // Prevent usernames which are PII from being sent to Sentry
    // https://docs.sentry.io/platforms/python/guides/logging/data-management/sensitive-data/#examples
    const anonymousId = Math.random().toString()
    Sentry.setUser({ id: anonymousId, username: anonymousId })
  }
}
