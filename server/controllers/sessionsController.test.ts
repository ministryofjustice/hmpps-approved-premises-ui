import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import SessionsController from './sessionsController'
import ProviderService from '../services/providerService'
import SessionService from '../services/sessionService'
import { ProjectAllocationsDto } from '../@types/shared'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'
import SessionUtils from '../utils/sessionUtils'

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
  })

  describe('index', () => {
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

      const requestHandler = sessionsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [{ value: 1001, text: 'Team Lincoln' }],
      })
    })
  })

  describe('search', () => {
    const resultTableRowsSpy = jest.spyOn(SessionUtils, 'sessionResultTableRows')

    beforeEach(() => {
      govukInputMock.mockImplementation(() => {
        return { items: [] }
      })
      resultTableRowsSpy.mockReturnValue([])
    })

    it('should throw an error if the request for team data fails', async () => {
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      providerService.getTeams.mockImplementation(() => {
        throw err
      })

      const response = createMock<Response>()
      await expect(requestHandler(request, response, next)).rejects.toThrow('Something went wrong')
    })

    it('should render the track progress page with errors', async () => {
      const requestHandler = sessionsController.search()

      const firstTeam = { id: 1, name: 'Team Lincoln' }
      const secondTeam = { id: 2, name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const req: DeepMocked<Request> = createMock<Request>({
        query: {
          team: '1',
        },
      })

      const response = createMock<Response>()
      await requestHandler(req, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [
          { value: firstTeam.id, text: firstTeam.name, selected: true },
          { value: secondTeam.id, text: secondTeam.name, selected: false },
        ],
        sessionRows: [],
        startDateItems: [],
        endDateItems: [],
        errors: {
          'startDate-day': { text: 'Include the start date' },
          'endDate-day': { text: 'Include the end date' },
        },
        errorSummary: [
          {
            text: 'Include the start date',
            href: '#startDate-day',
          },
          {
            text: 'Include the end date',
            href: '#endDate-day',
          },
        ],
      })
    })

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

      const formattedSessionRows = [[{ text: 'Some value' }, { text: 'Another value' }]]

      resultTableRowsSpy.mockReturnValue(formattedSessionRows)

      const sessions: ProjectAllocationsDto = {
        allocations: [allocation],
      }

      const response = createMock<Response>()
      sessionService.getSessions.mockResolvedValue(sessions)

      const firstTeam = { id: 1, name: 'Team Lincoln' }
      const secondTeam = { id: 2, name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const requestHandler = sessionsController.search()
      await requestHandler(request, response, next)

      expect(resultTableRowsSpy).toHaveBeenCalledWith(sessions)
      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [
          { value: firstTeam.id, text: firstTeam.name, selected: undefined },
          { value: secondTeam.id, text: secondTeam.name, selected: undefined },
        ],
        sessionRows: formattedSessionRows,
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

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [
          { value: firstTeam.id, text: firstTeam.name, selected: false },
          { value: secondTeam.id, text: secondTeam.name, selected: true },
        ],
        sessionRows: [],
        startDateItems: [],
        endDateItems: [],
      })
    })

    it('should render empty session results if error code returned from session client', async () => {
      const requestHandler = sessionsController.search()
      const err = { data: {}, status: 404 }

      sessionService.getSessions.mockImplementation(() => {
        throw err
      })

      const firstTeam = { id: 1, name: 'Team Lincoln' }
      const secondTeam = { id: 2, name: 'Team Grantham' }

      const teams = {
        providers: [firstTeam, secondTeam],
      }

      providerService.getTeams.mockResolvedValue(teams)

      const response = createMock<Response>()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [
          {
            selected: undefined,
            text: 'Team Lincoln',
            value: 1,
          },
          {
            selected: undefined,
            text: 'Team Grantham',
            value: 2,
          },
        ],
        sessionRows: [],
        startDateItems: [],
        endDateItems: [],
        errors: {},
        errorSummary: [],
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
        team: '1',
        'startDate-day': '07',
        'startDate-month': '07',
        'startDate-year': '2024',
        'endDate-day': '08',
        'endDate-month': '08',
        'endDate-year': '2025',
      }

      requestWithDates.query = query
      await requestHandler(requestWithDates, response, next)

      expect(response.render).toHaveBeenCalledWith('sessions/index', {
        teamItems: [
          {
            selected: true,
            text: 'Team Lincoln',
            value: 1,
          },
          {
            selected: false,
            text: 'Team Grantham',
            value: 2,
          },
        ],
        sessionRows: [],
        startDateItems: dateParts,
        endDateItems: dateParts,
        errors: {},
        errorSummary: [],
      })
    })
  })
})
