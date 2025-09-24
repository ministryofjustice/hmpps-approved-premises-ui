import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { ProjectAllocationsDto } from '../@types/shared'
import DateFormats from '../utils/dateUtils'

describe('SessionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let sessionsController: SessionsController
  const providerService = createMock<ProviderService>()
  const sessionService = createMock<SessionService>()

  beforeEach(() => {
    sessionsController = new SessionsController(providerService, sessionService)
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
      })
    })
  })

  describe('search', () => {
    it('should render the dashboard page with search results', async () => {
      const allocation = {
        id: 1001,
        projectId: 3,
        date: '2025-09-07',
        projectName: 'project-name',
        projectCode: 'prj',
        startTime: '09:00',
        endTime: '17:00',
        numberOfOffendersAllocated: 5,
        numberOfOffendersWithOutcomes: 3,
        numberOfOffendersWithEA: 1,
      }

      const sessions: ProjectAllocationsDto = {
        allocations: [allocation],
      }

      const response = createMock<Response>()
      sessionService.getSessions.mockResolvedValue(sessions)

      const requestHandler = sessionsController.search()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        teamItems: [{ value: 1001, text: 'Team Lincoln' }],
        sessionRows: [
          [
            { text: DateFormats.isoDateToUIDate(allocation.date, { format: 'medium' }) },
            { text: allocation.projectName },
            { text: allocation.projectCode },
            { text: allocation.startTime },
            { text: allocation.endTime },
            { text: allocation.numberOfOffendersAllocated },
            { text: allocation.numberOfOffendersWithOutcomes },
            { text: allocation.numberOfOffendersWithEA },
          ],
        ],
      })
    })

    it('should return teamItems with selected team', async () => {
      const sessions: ProjectAllocationsDto = {
        allocations: [],
      }

      sessionService.getSessions.mockResolvedValue(sessions)

      const firstTeam = { id: 1, name: 'Team Lincoln' }
      const secondTeam = { id: 2, name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const response = createMock<Response>()
      const requestHandler = sessionsController.search()
      const requestWithTeam = createMock<Request>({})
      requestWithTeam.query.team = '2'
      await requestHandler(requestWithTeam, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        teamItems: [
          { value: firstTeam.id, text: firstTeam.name, selected: false },
          { value: secondTeam.id, text: secondTeam.name, selected: true },
        ],
        sessionRows: [],
      })
    })

    it('should render empty results if error code returned from client', async () => {
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      sessionService.getSessions.mockImplementation(() => {
        throw err
      })

      const response = createMock<Response>()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        teamItems: [],
        sessionRows: [],
      })
    })
  })
})
