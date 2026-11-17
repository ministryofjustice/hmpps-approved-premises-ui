import config from '../config'

export const logToSentry = (exception: unknown) => {
  if ((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') && config.sentry.dsn) {
    import('@sentry/node').then(({ captureException }) => {
      captureException(exception)
    })
  }
}
