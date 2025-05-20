import bunyan, { LogLevel } from 'bunyan'
import bunyanFormat from 'bunyan-format'
import config from './server/config'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logger = bunyan.createLogger({
  name: 'Approved Premises Ui',
  stream: formatOut,
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
})

export default logger

export const logToSentry = (exception: unknown) => {
  // Importing Sentry when runnning Cypress causes an issue with webpack so we conditionally import it here
  if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') && config.sentry.dsn) {
    import('@sentry/node').then(({ captureException }) => {
      captureException(exception)
    })
  }
}
