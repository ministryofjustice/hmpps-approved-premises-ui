import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import DashboardController from './dashboardController'
import paths from '../paths/manage'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let applicationController: DashboardController

  beforeEach(() => {
    applicationController = new DashboardController()
  })

  describe('index', () => {
    it('should render the dashboard template', () => {
      const requestHandler = applicationController.index()

      requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.premises.index({}))
    })
  })
})
