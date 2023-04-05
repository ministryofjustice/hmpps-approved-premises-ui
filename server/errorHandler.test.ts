import express, { type Express } from 'express'
import createError from 'http-errors'
import request from 'supertest'

import path from 'path'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { userDetailsFactory } from './testutils/factories'

const setupApp = (production: boolean): Express => {
  const app = express()
  const user = userDetailsFactory.build()
  app.set('view engine', 'njk')

  nunjucksSetup(app, path)
  app.locals.user = user

  app.get('/known', (_req, res, _next) => {
    res.send('known')
  })
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    const app = setupApp(false)

    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    const app = setupApp(true)

    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not found')
      })
  })
})
