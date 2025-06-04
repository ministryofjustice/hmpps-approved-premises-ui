import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import StaticController from './staticController'

describe('StaticController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  let staticController: StaticController

  beforeEach(() => {
    staticController = new StaticController()
  })

  it('renders the given template', () => {
    const requestHandler = staticController.render('template-name')

    requestHandler(request, response, next)

    expect(response.render).toHaveBeenCalledWith('static/template-name.njk')
  })
})
