import config from '../config'
import { logToSentry } from './sentry'

jest.mock('@sentry/node', () => ({ captureException: jest.fn() }))

describe('logToSentry', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it.each(['production', 'test'])('reports exceptions in %s when a DSN is configured', async environment => {
    jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: environment })
    jest.replaceProperty(config.sentry, 'dsn', 'test-dsn')
    const exception = new Error('An exception')

    logToSentry(exception)

    const { captureException } = await import('@sentry/node')
    expect(captureException).toHaveBeenCalledWith(exception)
  })

  it('does not report exceptions in development', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'development' })
    jest.replaceProperty(config.sentry, 'dsn', 'test-dsn')

    logToSentry(new Error('An exception'))

    const { captureException } = await import('@sentry/node')
    expect(captureException).not.toHaveBeenCalled()
  })

  it('does not report exceptions without a DSN', async () => {
    jest.replaceProperty(process, 'env', { ...process.env, NODE_ENV: 'test' })
    jest.replaceProperty(config.sentry, 'dsn', '')

    logToSentry(new Error('An exception'))

    const { captureException } = await import('@sentry/node')
    expect(captureException).not.toHaveBeenCalled()
  })
})
