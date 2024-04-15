import { createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Path } from 'static-path'

import RedirectController from './redirectController'

describe('RedirectController', () => {
  const redirectController = new RedirectController()

  const request = createMock<Request>({})
  const response = createMock<Response>({})
  const next = createMock<NextFunction>({})

  it('should redirect to the specified path', async () => {
    const path = createMock<Path<string>>()
    const requestHandler = redirectController.redirect(path)

    await requestHandler(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith(301, path.pattern)
  })
})
