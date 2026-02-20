import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { path } from 'static-path'

import RedirectController from './redirectController'

describe('RedirectController', () => {
  const redirectController = new RedirectController()

  let request: DeepMocked<Request>
  let response: DeepMocked<Response>
  let next: DeepMocked<NextFunction>

  beforeEach(() => {
    request = createMock<Request>({})
    response = createMock<Response>({})
    next = createMock<NextFunction>({})
  })

  it('should redirect to the specified path and carry path parameters', async () => {
    const testParams = { id: 'bar', someOtherParam: 'qux' }
    const testPath = path('/foo').path(':id').path(':someOtherParam')

    const indexRequest = { ...request, params: testParams }

    const requestHandler = redirectController.redirect(testPath)

    await requestHandler(indexRequest, response, next)

    expect(response.redirect).toHaveBeenCalledWith(301, testPath(testParams))
  })

  it('can override a given parameter', async () => {
    const testPath = path('/foo').path(':foo').path('bar').path(':bar')
    const indexRequest = { ...request, params: { foo: 'baz', bar: 'baz' } }

    const requestHandler = redirectController.redirect(testPath, { foo: 'qux' })

    await requestHandler(indexRequest, response, next)

    expect(response.redirect).toHaveBeenCalledWith(301, testPath({ foo: 'qux', bar: 'baz' }))
  })
})
