/* istanbul ignore file */
import express from 'express'
import flash from 'connect-flash'

import path from 'path'
import createError from 'http-errors'
import methodOverride from 'method-override'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import { metricsMiddleware } from './monitoring/metricsApp'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import rateLimiter from './middleware/rateLimiter'

import { setUpSentryRequestHandler, setUpSentryErrorHandler } from './middleware/setUpSentry'

import routes from './routes'
import type { Controllers } from './controllers'
import type { Services } from './services'

// Add rate limits for each environment
const authenticationRateLimitWindow = process.env.NODE_ENV === 'production' ? 10 * 60 * 1000 : 60
const authenticationRateLimitMaxRequests = process.env.NODE_ENV === 'production' ? 10 : 100

const authorisationRateLimitWindow = process.env.NODE_ENV === 'production' ? 60 * 1000 : 60
const authorisationRateLimitMaxRequests = process.env.NODE_ENV === 'production' ? 60 * 1000 : 60

export default function createApp(controllers: Controllers, services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  setUpSentryRequestHandler(app)

  // Add method-override to allow us to use PUT and DELETE methods
  app.use(methodOverride('_method'))

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())

  app.use(flash())
  nunjucksSetup(app, path)

  app.use(
    setUpAuthentication(),
    rateLimiter({ windowMs: authenticationRateLimitWindow, maxRequests: authenticationRateLimitMaxRequests }),
  )
  app.use(
    authorisationMiddleware(),
    rateLimiter({ windowMs: authorisationRateLimitWindow, maxRequests: authorisationRateLimitMaxRequests }),
  )
  app.use(
    setUpCurrentUser(services),
    rateLimiter({ windowMs: authorisationRateLimitWindow, maxRequests: authorisationRateLimitMaxRequests }),
  )

  app.use(setUpCsrf())
  app.use((req, res, next) => {
    res.app.locals.infoMessages = req.flash('info')
    res.app.locals.successMessages = req.flash('success')
    return next()
  })
  app.use(routes(controllers))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  setUpSentryErrorHandler(app)
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
