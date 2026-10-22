// Import telemetry before anything else so OpenTelemetry can instrument bunyan and express
import './server/utils/azureAppInsights'
// Require Sentry setup before the app to allow for instrumentation of express
import './server/sentryInstrumentation'

import { app, metricsApp } from './server/index'
import logger from './logger'

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

metricsApp.listen(metricsApp.get('port'), () => {
  logger.info(`Metrics server listening on port ${metricsApp.get('port')}`)
})
