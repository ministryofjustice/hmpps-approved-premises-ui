import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DashboardController from './dashboardController'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('index', () => {
    it('should render the dashboard page', async () => {
      const response = createMock<Response>()

      const requestHandler = dashboardController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index')
    })
  })
})
