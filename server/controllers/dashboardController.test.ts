import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { ServiceSection } from '@approved-premises/ui'
import { sectionsForUser } from '../utils/users'

import DashboardController from './dashboardController'

jest.mock('../utils/users')

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
      const sections = createMock<Array<ServiceSection>>()
      ;(sectionsForUser as jest.Mock).mockReturnValue(sections)

      const requestHandler = dashboardController.index()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('dashboard/index', {
        pageHeading: 'Approved Premises',
        hideNav: true,
        sections,
      })
    })
  })
})
