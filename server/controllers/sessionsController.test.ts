import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { ProjectAllocationsDto } from '../@types/shared'
import DateFormats from '../utils/dateUtils'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'

jest.mock('../forms/GovukFrontendDateInput')

describe('SessionsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const govukInputMock: jest.Mock = GovukFrontendDateInput as unknown as jest.Mock

  let sessionsController: SessionsController
  const providerService = createMock<ProviderService>()
  const sessionService = createMock<SessionService>()

  beforeEach(() => {
    sessionsController = new SessionsController(providerService, sessionService)
    govukInputMock.mockImplementation(() => {
      return { items: [] }
    })
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
        startDateItems: [],
        endDateItems: [],
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
        startDateItems: [],
        endDateItems: [],
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
        startDateItems: [],
        endDateItems: [],
      })
    })

    it('should return the formatted date query parameters', async () => {
      const dateParts = [
        { name: 'day', value: '09', classes: 'classes' },
        { name: 'month', value: '10', classes: 'classes' },
      ]

      govukInputMock.mockImplementation(() => {
        return { items: dateParts }
      })
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      sessionService.getSessions.mockImplementation(() => {
        throw err
      })

      const response = createMock<Response>()
      const requestWithDates = createMock<Request>({})
      const query = {
        'startDate-day': '07',
        'startDate-month': '07',
        'startDate-year': '2024',
        'endDate-day': '08',
        'endDate-month': '08',
        'endDate-year': '2025',
      }

      requestWithDates.query = query
      await requestHandler(requestWithDates, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/show', {
        teamItems: [],
        sessionRows: [],
        startDateItems: dateParts,
        endDateItems: dateParts,
      })
    })
  })
})
