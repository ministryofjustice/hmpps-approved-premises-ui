import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import managePaths from '../paths/manage'

import DashboardController from './dashboardController'

describe('DashboardController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let dashboardController: DashboardController

  beforeEach(() => {
    dashboardController = new DashboardController()
  })

  describe('index', () => {
    it('should render the dashboard template', () => {
      const requestHandler = dashboardController.index()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('dashboard/index', {
        pageHeading: 'Approved Premises',
        applyPath: applyPaths.applications.index.pattern,
        assessPath: assessPaths.assessments.index.pattern,
        managePath: managePaths.premises.index.pattern,
      })
    })
  })
})
