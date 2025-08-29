import * as Sentry from '@sentry/node'
import config from './config'

Sentry.init({
  dsn: config.sentry.dsn,
  integrations: [Sentry.httpIntegration(), Sentry.expressIntegration],
  enableLogs: true,
})
