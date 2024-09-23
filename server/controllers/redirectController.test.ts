import { createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { path } from 'static-path'

import RedirectController from './redirectController'

describe('RedirectController', () => {
  const redirectController = new RedirectController()

  const request = createMock<Request>({})
  const response = createMock<Response>({})
  const next = createMock<NextFunction>({})

  it('should redirect to the specified path and carry path parameters', async () => {
    const testParams = { id: 'bar', someOtherParam: 'qux' }
    const testPath = path('/foo').path(':id').path(':someOtherParam')
    request.params = testParams

    const requestHandler = redirectController.redirect(testPath)

    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith(301, testPath(testParams))
  })
})
