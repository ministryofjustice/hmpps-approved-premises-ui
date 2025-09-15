import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'

describe('SessionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let sessionsController: SessionsController
  const providerService = createMock<ProviderService>()

  beforeEach(() => {
    sessionsController = new SessionsController(providerService)
  })

  describe('show', () => {
    it('should render the dashboard page', async () => {
      const teams = {
        providers: [
          {
            id: 1001,
            name: 'Team Lincoln',
          },
        ],
      }

      const response = createMock<Response>()
      providerService.getTeams.mockResolvedValue(teams)

      const requestHandler = sessionsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        teamItems: [{ value: 1001, text: 'Team Lincoln' }],
        sessions: [],
      })
    })
  })
})
