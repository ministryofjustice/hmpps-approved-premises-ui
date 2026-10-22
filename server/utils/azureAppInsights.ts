/* istanbul ignore file */

import { initialiseTelemetry, flushTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import applicationVersion from '../applicationVersion'
import logger from '../../logger'

initialiseTelemetry({
  serviceName: applicationVersion.packageData.name,
  serviceVersion: applicationVersion.buildNumber,
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
})
  .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/ping', '/assets/*']))
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down...`)
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
