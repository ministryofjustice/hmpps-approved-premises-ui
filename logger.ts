import bunyan, { LogLevel } from 'bunyan'
import bunyanFormat from 'bunyan-format'

export { logToSentry } from './server/utils/sentry'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logger = bunyan.createLogger({
  name: 'Approved Premises Ui',
  stream: formatOut,
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
})

export default logger
