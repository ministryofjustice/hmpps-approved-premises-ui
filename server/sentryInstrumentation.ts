/* istanbul ignore file */

import * as Sentry from '@sentry/node'
import config from './config'
import applicationVersion from './applicationVersion'

if (config.sentry.dsn) {
  // Prevent usernames which are PII from being sent to Sentry
  // https://docs.sentry.io/platforms/javascript/guides/express/data-management/sensitive-data/#examples
  const anonymousId = Math.random().toString()
  Sentry.setUser({ id: anonymousId, username: anonymousId })

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.environment,
    release: applicationVersion.gitRef,
    integrations: [Sentry.expressIntegration()],
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
