import type { Request, RequestHandler, Response } from 'express'
import ProviderService from '../services/providerService'
import { ProjectAllocationsDto } from '../@types/shared'
import SessionService from '../services/sessionService'

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
      const teamId = Number(query.team)
      const startDate = `${query['startDate-year']}-${query['startDate-month']}-${query['startDate-day']}`
      const endDate = `${query['endDate-year']}-${query['endDate-month']}-${query['endDate-day']}`

      try {
        const providerId = '1000'
        const teamItems = await this.getTeams(providerId, res)

        const sessions = await this.sessionService.getSessions({
          username: res.locals.user.username,
          teamId,
          startDate,
          endDate,
        })

        res.render('sessions/show', { teamItems, sessionRows: this.sessionRows(sessions) })
      } catch {
        // Response error handling to be added
        res.render('sessions/show', { teamItems: [], sessionRows: [] })
      }
    }
  }

  private async getTeams(providerId: string, res: Response) {
    const teams = await this.providerService.getTeams(providerId, res.locals.user.username)

    const teamItems = teams.providers.map(team => ({
      value: team.id,
      text: team.name,
    }))
    return teamItems
  }

  private sessionRows(sessions: ProjectAllocationsDto) {
    return sessions.allocations.map(session => {
      return [
        { text: session.date },
        { text: session.projectName },
        { text: session.projectCode },
        { text: session.startTime },
        { text: session.endTime },
        { text: session.numberOfOffendersAllocated },
        { text: session.numberOfOffendersWithOutcomes },
        { text: session.numberOfOffendersWithEA },
      ]
    })
  }
}
