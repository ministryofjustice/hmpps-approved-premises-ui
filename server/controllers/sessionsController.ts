import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import { ProjectAllocationsDto } from '../@types/shared'
import SessionService from '../services/sessionService'
import DateFormats from '../utils/dateUtils'
import GovukFrontendDateInput from '../forms/GovukFrontendDateInput'

export default class SessionsController {
  constructor(
    private readonly providerService: ProviderService,
    private readonly sessionService: SessionService,
  ) {}

  show(): RequestHandler {
    return async (_req: Request, res: Response) => {
      const providerId = '1000'
      const teamItems = await this.getTeams(providerId, res)

      res.render('sessions/show', { teamItems })
    }
  }

  search(): RequestHandler {
    return async (_req: Request, res: Response) => {
      // Assigning the query object to a standard object prototype to resolve TypeError: Cannot convert object to primitive value
      const query = { ..._req.query }
      const startDateInput = new GovukFrontendDateInput(query, 'startDate')
      const endDateInput = new GovukFrontendDateInput(query, 'endDate')

      const teamId = Number(query.team)
      const startDate = `${query['startDate-year']}-${query['startDate-month']}-${query['startDate-day']}`
      const endDate = `${query['endDate-year']}-${query['endDate-month']}-${query['endDate-day']}`

      const pageSearchValues = {
        startDateItems: startDateInput.items,
        endDateItems: endDateInput.items,
      }

      try {
        const providerId = '1000'
        const teamItems = await this.getTeams(providerId, res, teamId)

        const sessions = await this.sessionService.getSessions({
          username: res.locals.user.username,
          teamId,
          startDate,
          endDate,
        })

        res.render('sessions/show', { ...pageSearchValues, teamItems, sessionRows: this.sessionRows(sessions) })
      } catch {
        // Response error handling to be added
        res.render('sessions/show', { ...pageSearchValues, teamItems: [], sessionRows: [] })
      }
    }
  }

  private async getTeams(providerId: string, res: Response, teamId: number | undefined = undefined) {
    const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

    const teamItems = teams.providers.map(team => {
      const selected = teamId ? team.id === teamId : undefined

      return {
        value: team.id,
        text: team.name,
        selected,
      }
    })
    return teamItems
  }

  private sessionRows(sessions: ProjectAllocationsDto) {
    return sessions.allocations.map(session => {
      return [
        { text: DateFormats.isoDateToUIDate(session.date, { format: 'medium' }) },
        { text: session.projectName },
        { text: session.projectCode },
        { text: DateFormats.stripTime(session.startTime) },
        { text: DateFormats.stripTime(session.endTime) },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }
}
