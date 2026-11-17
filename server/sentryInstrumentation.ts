/* istanbul ignore file */

import * as Sentry from '@sentry/node'
import config from './config'
import applicationInfoSupplier from './applicationInfo'

if (config.sentry.dsn) {
  const applicationInfo = applicationInfoSupplier()
  // Prevent usernames which are PII from being sent to Sentry
  // https://docs.sentry.io/platforms/javascript/guides/express/data-management/sensitive-data/#examples
  const anonymousId = Math.random().toString()
  Sentry.setUser({ id: anonymousId, username: anonymousId })

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.environment,
    release: applicationInfo.gitRef,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    },
    integrations: [Sentry.expressIntegration(), Sentry.httpIntegration({ disableIncomingRequestSpans: true })],
    enableOpenTelemetrySetup: true,
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
