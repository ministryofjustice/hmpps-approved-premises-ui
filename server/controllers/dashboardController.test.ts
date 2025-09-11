import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import DashboardController from './dashboardController'
import ExampleService from '../services/exampleService'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController
  const exampleService = createMock<ExampleService>()

  beforeEach(() => {
    dashboardController = new DashboardController(exampleService)
  })

  describe('index', () => {
    it('should render the dashboard page', async () => {
      const response = createMock<Response>()
      exampleService.getExampleData.mockResolvedValue({ some: 'data' })

      const requestHandler = dashboardController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('pages/index', { exampleData: { some: 'data' } })
    })
  })
})
