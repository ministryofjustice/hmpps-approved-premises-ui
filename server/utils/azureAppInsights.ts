/* istanbul ignore file */

import { initialiseTelemetry, flushTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { SpanFilterFn, SpanInfo } from '@ministryofjustice/hmpps-azure-telemetry/src/main'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
const filterSentry: SpanFilterFn = (span: SpanInfo) => !span.attributes['sentry.op']
initialiseTelemetry({
  serviceName: applicationInfo.applicationName,
  serviceVersion: process.env.BUILD_NUMBER || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
})
  .addFilter(filterSentry)
  .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/info', '/assets/*', '/favicon.ico']))
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

const shutdown = async (signal: string) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports,global-require
  const { default: logger } = require('../../logger')
  logger.info(`${signal} received, shutting down...`)
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
